// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;


contract Logbook {
    struct Ascent {
        Climber climber;
        Route route;
        Climber[] witnesses;
        string image;
        uint epochSecond;  // when it was climbed
        string notes;
    }

    struct Climber {
        address climberAddress;
        string name;  // must be nonempty!
        bool registered;
    }

    struct Route {
        string name;
        string location;
        string difficulty;
    }

    mapping (address => Climber) internal climbers;  // maps climber address to Climber object
    mapping (address => Ascent[]) internal ascentsByClimber;  // maps climber address to list of Ascent objects

    function climberIsRegistered(address _climberAddress) public view returns (bool) {
        // NOTE: assumes all climbers must have nonempty name
        return bytes(climbers[_climberAddress].name).length != 0;
    }

    function addClimber(string memory _name) public {
        require(bytes(_name).length != 0, "Cannot add climber with empty name.");
        address climberAddress = msg.sender;
        require(climberIsRegistered(climberAddress), "Climber already registered.");
        climbers[climberAddress] = Climber(climberAddress, _name, true);
    }
}
