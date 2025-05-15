// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract PlayerStatus{
    mapping(string => bool) private tasks;
    string[] private taskNames;

    // constructor takes array of strings and sets them as tasks intially false
    constructor(string[] memory _tasks) {
        for(uint i = 0; i < _tasks.length; i++){
            tasks[_tasks[i]] = false;
            taskNames.push(_tasks[i]);
        }
    }

    function checkTaskExists(string memory _task) public view returns(bool){
        for (uint i = 0; i < taskNames.length; i++){
            if(keccak256(abi.encodePacked(taskNames[i])) == keccak256(abi.encodePacked(_task))){
                return true;
            }
        }
        return false;
    }

    // function to mark the task as completed
    function completeTask(string memory _task) public returns(bool){
        require(checkTaskExists(_task), "Task does not exist");
        tasks[_task] = true;

        return gameStatus();
    }

    // function to check if the task is completed
    function isTaskCompleted(string memory _task) public view returns(bool){
        require(checkTaskExists(_task), "Task does not exist");
        return tasks[_task];
    }

    // function reset the tasks
    function reset() public {
        for(uint i = 0; i < taskNames.length; i++){
            tasks[taskNames[i]] = false;
        }
    }

    function getTaskStatus() public view returns(string[] memory, bool[] memory){
        bool[] memory status;
        for(uint i = 0; i < taskNames.length; i++){
            status[i] = tasks[taskNames[i]];
        }
        return (taskNames, status);
    }

    function gameStatus() public view returns(bool){
        for(uint i = 0; i < taskNames.length; i++){
            if(!tasks[taskNames[i]]){
                return false;
            }
        }
        return true;
    }

    function getTasks() public view returns(string[] memory){
        return taskNames;
    }
}
