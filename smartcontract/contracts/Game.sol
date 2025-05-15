// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "./PlayerStatus.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// 0x26EC701A2866A42228Dc559Aa13190A4348f784d
contract Game is Ownable {
    string public greenfield;
    string public name;
    string public thumbnail;
    uint public price;
    string[] private tasks;

    // purchased players metamask address to player contract address
    mapping(address => address) private players;

    constructor(string memory _name,string memory _greenfield, uint _price,string memory _thumbnail,string[] memory _tasks) Ownable(msg.sender) {
        name = _name;
        greenfield = _greenfield;
        price = _price;
        thumbnail = _thumbnail;
        tasks = _tasks;
    }

    // function to buy the game
    function buyGame() external payable {
        require(players[msg.sender] == address(0), "You have already bought the game");
        require(msg.value >= price, "Insufficient funds");

        payable(owner()).transfer(msg.value);

        PlayerStatus playerContract = new PlayerStatus(tasks);
        players[msg.sender] = address(playerContract);
    }

    // function to get the player contract address
    function getPlayerContract() public view returns(address){
        return players[msg.sender];
    }
}
