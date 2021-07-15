// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;


contract Logbook {
    struct Ascent {
        uint id;
        Climber climber;
        Route route;
        string image;
        uint epochSecond;  // when it was climbed
        string notes;
        address[] witnesses;  // addresses of people who verify that the climber completed the route
    }

    struct Climber {
        address climberAddress;
        string name;  // must be nonempty!
    }

    struct Route {
        string name;
        string location;
        string difficulty;
    }

    mapping(address => Climber) internal addressToClimber;  // maps climber address to Climber object
    Ascent[] ascents;  // all ascents

    function climberIsRegistered(address _climberAddress) public view returns (bool) {
        // NOTE: assumes all climbers must have nonempty name
        return bytes(addressToClimber[_climberAddress].name).length != 0;
    }

    function registerClimber(string memory _name) public {
        // check that name is valid
        require(bytes(_name).length != 0, "Cannot add climber with empty name.");

        // dont register the same address twice
        address _climberAddress = msg.sender;
        require(!climberIsRegistered(_climberAddress), "This climber is already registered. Cannot add the climber again.");

        // save the new Climber
        addressToClimber[_climberAddress] = Climber(_climberAddress, _name);
    }

    function addAscentForSender(
        string memory _routeName,
        string memory _routeLocation,
        string memory _routeDifficulty,
        string memory _image,
        uint _epochSecond,
        string memory _notes
    ) public {
        // check that sender is registered
        address _climberAddress = msg.sender;
        require(climberIsRegistered(_climberAddress), "Climber must already be registered.");

        // initialize the ascent
        Ascent memory _newAscent;
        _newAscent.id = ascents.length;
        _newAscent.climber = addressToClimber[_climberAddress];
        _newAscent.route = Route(_routeName, _routeLocation, _routeDifficulty);
        _newAscent.image = _image;
        _newAscent.epochSecond = _epochSecond;
        _newAscent.notes = _notes;

        // save the ascent
        ascents.push(_newAscent);
    }

    function getAllAscents() public view returns (Ascent[] memory) {
        return ascents;
    }

    function ascentWithIdExists(uint _ascentId) private view returns (bool) {
        return _ascentId >= 0 && _ascentId < ascents.length;
    }

    function witnessAscent(uint _ascentId) public {
        address _newWitnessAddress = msg.sender;
        Ascent memory _ascent = ascents[_ascentId];

        // check that ascent id and sender are valid
        require(ascentWithIdExists(_ascentId), "Invalid ascent id.");
        require(climberIsRegistered(_newWitnessAddress), "Cannot witness ascent before registering.");
        require(_ascent.climber.climberAddress != _newWitnessAddress, "Cannot witness your own ascent");

        // check that witness hasn't already certified the ascent
        uint idx = 0;
        while (idx < _ascent.witnesses.length) {
            require(_ascent.witnesses[idx] != _newWitnessAddress, "Cannot witness the same ascent twice");
        }

        // add the witness
        ascents[_ascentId].witnesses.push(_newWitnessAddress);
    }
}
