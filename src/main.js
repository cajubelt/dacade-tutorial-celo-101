import Web3 from 'web3'
import {newKitFromWeb3} from '@celo/contractkit'
import logbookAbi from '../contract/logbook.abi.json'
import BigNumber from "bignumber.js";


const LogbookContractAddress = "0xC98D8477f1aFf6023624e34F9CaCECc1523dB760"

const ERC20_DECIMALS = 18

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

// async function approve(_price) {
//     const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)
//
//     const result = await cUSDContract.methods
//         .approve(MPContractAddress, _price)
//         .send({ from: kit.defaultAccount })
//     return result
// }

// const getBalance = async function () {
//     const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
//     const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
//     document.querySelector("#balance").textContent = cUSDBalance
// }

const getAscents = async function() {
    // const _productsLength = await contract.methods.getProductsLength().call()
    // const _products = []
    // for (let i = 0; i < _productsLength; i++) {
    //     let _product = new Promise(async (resolve, reject) => {
    //         let p = await contract.methods.readProduct(i).call()
    //         resolve({
    //             index: i,
    //             owner: p[0],
    //             name: p[1],
    //             image: p[2],
    //             description: p[3],
    //             location: p[4],
    //             price: new BigNumber(p[5]),
    //             sold: p[6],
    //         })
    //     })
    //     _products.push(_product)
    // }
    // ascents = await Promise.all(_products)
    // renderProducts()
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
    // await getBalance()
    await getAscents()
    notificationOff()
});

document
    .querySelector("#newProductBtn")
    .addEventListener("click", async (e) => {
        const params = [
            document.getElementById("newAscentRouteName").value,
            document.getElementById("newAscentLocation").value,
            document.getElementById("newAscentDifficulty").value,
            document.getElementById("newImgUrl").value,
            new Date() / 1000,  // fixme use date selector for this instead
            document.getElementById("newAscentDescription").value
        ]
        notification(`⌛ Adding ascent of "${params[0]}"...`)
        try {
            const result = await contract.methods
                .addAscentForSender(...params)
                .send({ from: kit.defaultAccount })
        } catch (error) {
            notification(`⚠️ ${error}.`)
        }
        notification(`🎉 You successfully added "${params[0]}".`)
        getAscents()
    })

document.querySelector("#logbook").addEventListener("click", async (e) => {
    if (e.target.className.includes("witnessBtn")) {
        // todo switch to "witness" function
        const ascentId = e.target.id
        // const index = e.target.id
        // notification("⌛ Waiting for payment approval...")
        // try {
        //     await approve(products[index].price)
        // } catch (error) {
        //     notification(`⚠️ ${error}.`)
        // }
        // notification(`⌛ Awaiting payment for "${products[index].name}"...`)
        // try {
        //     const result = await contract.methods
        //         .buyProduct(index)
        //         .send({ from: kit.defaultAccount })
        //     notification(`🎉 You successfully bought "${products[index].name}".`)
        //     getProducts()
        //     getBalance()
        // } catch (error) {
        //     notification(`⚠️ ${error}.`)
        // }
    }
})
