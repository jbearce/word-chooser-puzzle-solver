/************************
 * Global variables
 * *********************/
 
var wordList = [];
var tumblerSets = [[]];
var matches = [];

/************************
 * Functions
 * *********************/

//NOTE: consider using this dictionary: https://github.com/dwyl/english-words
//goal: take input file url (text string) and parse it into an array
document.onreadystatechange = function import_file() 
{
    var dictionaryFile = "dictionary.json";
    var output = [];

    fetch(dictionaryFile)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
      }
      return response.json();
    })
    .then(function(json) {
      for(var i = 0; i < json.data.length; i++) {
        var listItem = document.createElement('li');
        output.push(json.data[i]);
      }
    });

    wordList = output;
}

//dependency of generateTumblers 
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
    var wordSize = inWord.length;
    var wordListSize = wordList.length;
    var checkedCount = 0;
    console.log("Checking against " + wordListSize + " words...");
    for(var i = 0; i < wordListSize; ++i)
    {
        if(i < 20)
        {
            console.log(wordList[i]);
        }
        if (wordList[i].length == wordSize)
        {
            var dictionaryWord = wordList[i];
            for(var j = 0; j < wordSize; ++j)
            {
                //word identified as incorrect
                if(inWord[j] != dictionaryWord[j])
                {
                    console.log("word not a match: " + dictionaryWord);
                    break;
                } 
                //word identified as correct by process of elimination
                else if (j == wordSize - 1)
                {
                    matches.push(inWord);
                    console.log("Word found: " + inWord);
                    break;
                }
            }
        }
    }
}

/*
    Iterates through every combination of characters that can be formed. On each iteration,
    the formed "word" is passed to is_word() for evaluation. Identified words are compiled
    into an array and returned
*/
var calcButton = document.createElement("input");
calcButton.onclick = function get_matches()
{
    console.log("Initiate puzzle solver...");
    var word = "";
    var tumblerMaxes = [];
    var tumblerCount = document.getElementById("qty_tumblers");
    tumblerCount = tumblerCount.value;
    var tumblerSets = [[]];

    //populate tumblerSets and tumblerLimits
    for(var i = 0; i < tumblerCount; ++i)
    {
        var currTumbler = "tumbler_letters_" + i;
        currTumbler = document.getElementById(currTumbler);
        var tumblerString = currTumbler.value;
        var tumblerI = [];
        for(var j = 0; j < tumblerString.size; ++j) {
            tumblerI.push(tumblerString[j]);
        }
        tumblerSets.push(tumblerI);
        tumblerMaxes.push(tumblerSets[i].length);
        
    }

    var tumblerPositions = [];
    for(var i = 0; i < tumblerSets.length; ++i) 
    {
        tumblerPositions.push(0);
    }

    var lastPos = tumblerSets.length - 1;
    var currPos = lastPos;
    var carriedOne = false;

    console.log("lastpos: " + lastPos);
    console.log("currPos: " + currPos);
    while(currPos >= 0 && false == true)
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
    var output = document.getElementById("output_box");
    output.innerHTML = matches;
    console.log("Done!");
    console.log(matches);
}
