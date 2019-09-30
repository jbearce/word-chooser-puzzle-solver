/************************
 * Global variables
 * *********************/
 
var wordList = [];
var tumblerSets = [[]];

/************************
 * Functions
 * *********************/

//NOTE: consider using this dictionary: https://github.com/dwyl/english-words
//goal: take input file url (text string) and parse it into an array
document.onreadystatechange = function import_file() 
{
    var dictionaryFile = "dictionary.json";
    var output = [];
    var file = new XMLHttpRequest();
    file.open("GET", dictionaryFile, false);
    file.send();
    file.onreadystatechange = function() 
    {
        if (file.readyState == 4 && (file.status == 200 || file.status == 0)) 
        {
            output = JSON.parse(jsonFile.responseText);
        }
    }

    return output.data;
}

/*
    Outputs the current "word" written by the tumblers to a string. Developers can then
    process this however they'd like.
*/
function print_code(input, inputPos) 
{
    output = "";
    inputSize = input.length;
    for(var i = 0; i < inputSize; ++i) 
    {
        output += input[i][inputPos[i]];
    }
    return output;
}

/*
    Checks whether the "word" currently displayed is a known real word
*/
function add_if_word(inWord)
{
    var found_word = false;
    var wordSize = inWord.length;
    var wordListSize = wordList.length;
    for(var i = 0; i < wordListSize; ++i) {
        if (wordList[i].length == wordSize) {
            for(var j = 0; j < wordSize; ++j) {
                if(inWord[j] != wordList[i][j]) {
                    break;
                } else if (j == wordSize - 1) {
                    wordList.push(inWord);
                    break;
                }
            }
        }
    }
}

//dependency of generateTumblers. 
function add_children(wrapper, numChildren, baseText, baseId) 
{
    for(var i = 0; i < numChildren; ++i)
    {
        var singleWrapper = document.createElement("div");
            singleWrapper.setAttribute("class", "input_wrapper");
        wrapper.appendChild(singleWrapper);
        var itemLabel = baseText + (i+1);
        var itemId = baseId + i;
        var childLabel = document.createElement("label");
            childLabel.setAttribute("for", itemId);
            childLabel.innerHTML = itemLabel;
            singleWrapper.appendChild(childLabel);

        var child = document.createElement("input");
            child.setAttribute("type", "text");
            child.setAttribute("id", "tumbler_letters_" + i);
            singleWrapper.appendChild(child);
    }
}

/*
    If the user wants to generate a puzzle, this will output N tumblers. Each tumbler
    can have however many or few letters the user wants, independent of the number of
    options on other tumblers
*/
document.getElementById("generate_tumblers").onclick = function generate_tumblers() 
{
    var numChildren = document.getElementById("qty_tumblers");
    console.log(numChildren);
    numChildren = numChildren.value;
    var tumblerValuesWrapper = document.getElementById("tumbler_values");
    var p = document.createElement("p");
    p.innerHTML = "For each tumbler, list the letters you want to use. For example, type \"abcler\" to add those letters to a tumbler. Only type letters here. Do not add commas, spaces, or other seperators";
    tumblerValuesWrapper.appendChild(p);
    add_children(tumblerValuesWrapper, numChildren, "List letters in tumbler ", "tumbler_letters_");
    calcButton.setAttribute("type", "button");
    calcButton.setAttribute("id", "calcTumblers");
    calcButton.setAttribute("value", "Calculate");
    tumblerValuesWrapper.appendChild(calcButton);
}

/*
    Iterates through every combination of characters that can be formed. On each iteration,
    the formed "word" is passed to is_word() for evaluation. Identified words are compiled
    into an array and returned
*/
var calcButton = document.createElement("input");
calcButton.onclick = function get_matches() 
{
    var matches = [[]];
    var word = "";
    var tumblerMaxes = [[]];
    for(var i = 0; i < tumblerSets.length; ++i)
    {
        tumblerMaxes.push(tumblerSets[i].length);
    }

    var tumblerPositions = [[]];
    var tumblerPositionsSize = tumblerPositions.length;
    for(var i = 0; i < tumblerPositionsSize; ++i) {
        tumblerPositions[i] = 0;
    }

    var lastPos = tumblerSets.length - 1;
    var currPos = lastPos;
    var carriedOne = false;
    while(currPos >= 0)
    {   
        var curr_word = print_code(tumblerSets, tumblerPositions);
        add_if_word(curr_word);

        tumblerPositions[lastPos]++;
        if (tumblerPositions[lastPos] > tumblerMaxes[lastPos])
        {
            tumblerPositions[lastPos] = 0;
            carriedOne = true;
            currPos = lastPos -1;
            while(carriedOne && currPos >= 0)
            {
                if (tumblerPositions[currPos] < tumblerMaxes[currPos])
                {
                    tumblerPositions[currPos]++;
                    carriedOne = false;
                } else if (tumblerPositions[currPos] == tumblerMaxes[currPos] && currPos >= 0)
                {
                    tumblerPositions[currPos] = 0;
                    currPos--;
                }
            }
        }
    }
    return matches;
}

