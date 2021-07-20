import Web3 from 'web3'
import {newKitFromWeb3} from '@celo/contractkit'
import logbookAbi from '../contract/logbook.abi.json'

const LogbookContractAddress = "0xC98D8477f1aFf6023624e34F9CaCECc1523dB760"

let kit
let contract
let ascents = []
const connectCeloWallet = async function () {
    if (window.celo) {
        notification("⚠️ Please approve this DApp to use it.")
        try {
            await window.celo.enable()
            notificationOff()

            const web3 = new Web3(window.celo)
            kit = newKitFromWeb3(web3)

            const accounts = await kit.web3.eth.getAccounts()
            kit.defaultAccount = accounts[0]

            contract = new kit.web3.eth.Contract(logbookAbi, LogbookContractAddress)
        } catch (error) {
            notification(`⚠️ ${error}.`)
        }
    } else {
        notification("⚠️ Please install the CeloExtensionWallet.")
    }
}

const getAscents = async function() {
    ascents = await contract.methods.getAllAscents().call()
    renderAscents()
}

function renderAscents() {
    document.getElementById("logbook").innerHTML = ""
    ascents.forEach((_ascent) => {
        const newDiv = document.createElement("div")
        newDiv.className = "col-md-4"
        newDiv.innerHTML = ascentTemplate(_ascent)
        document.getElementById("logbook").appendChild(newDiv)
    })
}

function ascentTemplate(_ascent) {
    return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_ascent.image}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${_ascent.witnesses.length} Witnesses
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_ascent.climber.name)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_ascent.route.name + ": " + _ascent.route.difficulty}</h2>
        <p class="card-text mb-4" style="min-height: 82px">
          ${_ascent.notes}             
        </p>
        <p class="card-text mt-4">
          <i class="bi bi-geo-alt-fill"></i>
          <span>${_ascent.route.location}</span>
        </p>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-dark witnessBtn fs-6 p-3" id=${
        _ascent.id
    }>
            Certify ascent
          </a>
        </div>
      </div>
    </div>
  `
}

function identiconTemplate(_address) {
    const icon = blockies
        .create({
            seed: _address,
            size: 8,
            scale: 16,
        })
        .toDataURL()

    return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
    document.querySelector(".alert").style.display = "block"
    document.querySelector("#notification").textContent = _text
}

function notificationOff() {
    document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
    notification("⌛ Loading...")
    await connectCeloWallet()
    await getAscents()
    notificationOff()
});

document
    .querySelector("#newAscentBtn")
    .addEventListener("click", async (e) => {
        const params = [
            document.getElementById("newAscentRouteName").value,
            document.getElementById("newAscentLocation").value,
            document.getElementById("newAscentDifficulty").value,
            document.getElementById("newImgUrl").value,
            1,  // fixme use date selector for this instead
            document.getElementById("newAscentDescription").value
        ]
        notification(`⌛ Adding ascent of "${params[0]}"...`)
        try {
            const result = await contract.methods
                .addAscentForSender(...params)
                .send({ from: kit.defaultAccount })
            console.log(JSON.stringify(result))
            notification(`🎉 Successfully added your ascent of "${params[0]}"`)
            getAscents()
        } catch (error) {
            notification(`⚠️ ${error}.`)
        }
    })

document.querySelector("#logbook").addEventListener("click", async (e) => {
    if (e.target.className.includes("witnessBtn")) {
        const ascentId = e.target.id
        try {
            await contract.methods
                .witnessAscent(ascentId)
                .send({from: kit.defaultAccount})
            notification("Successfully added a witness for the ascent")
        } catch (error) {
            notification(`⚠️ ${error}.`)
        }
    }
})
