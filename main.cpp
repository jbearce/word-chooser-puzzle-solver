#include <vector>
#include <string>
#include <iostream>
#include <fstream>

std::vector<std::string> import_file(std::string input) 
{
    std::vector<std::string> output;
    std::ifstream inputFile(input);
    std::string fileLine;
    if (inputFile.is_open()) 
    {
        while(std::getline(inputFile, fileLine)) 
        {
            output.push_back(fileLine);
        }
    }
    inputFile.close();
    return output;
}

/*
    Outputs the current "word" written by the tumblers to a string. Developers can then
    process this however they'd like.
*/
std::string print_code(std::vector<std::vector<char>> input, std::vector<int> inputPos) 
{
    std::string output = "";
    int inputSize = input.size();
    for(int i = 0; i < inputSize; ++i) 
    {
        output += input[i][inputPos[i]];
    }
    return output;
}

/*
    If the user wants to generate a puzzle, this will output N tumblers. Each tumbler
    can have however many or few letters the user wants, independent of the number of
    options on other tumblers
*/
std::vector<std::vector<char>> generateTumblers(int numLetters) 
{
    std::vector<std::vector<char>> output;
    output.resize(numLetters);
    for(int i = 0; i < numLetters; ++i) 
    {
        std::cout << "Enter qty letters in tumbler " << (i+1) << ": ";
        int tumblerSize = 0;
        std::cin >> tumblerSize;
        output[i].resize(tumblerSize);
        for(int j = 0; j < tumblerSize; ++j) 
        {
            char tumblerLetter;
            std::cout << "Tumbler " << (i+1) << ", letter " << (j+1) << ": ";
            std::cin >> tumblerLetter;
            output[i][j] = tumblerLetter;
        }
    }
    return output;
}

/*
    Checks whether the "word" currently displayed is a known real word
*/
bool is_word(std::string word, std::vector<std::string> wordList)
{
    bool found_word = false;
    int wordSize = word.size();
    int wordListSize = wordList.size();
    for(int i = 0; i < wordListSize; ++i) {
        if (wordList[i].size() == wordSize) {
            for(int j = 0; j < wordSize; ++j) {
                if(word[j] != wordList[i][j]) {
                    break;
                } else if (j == wordSize - 1) {
                    found_word = true;
                    return found_word;
                }
            }
        }
    }
    return found_word;
}

/*
    Iterates through every combination of characters that can be formed. On each iteration,
    the formed "word" is passed to is_word() for evaluation. Identified words are compiled
    into a vector<string> list, and returned
*/
std::vector<std::string> get_matches (
    std::vector<std::vector<char>> tumblerSets, 
    std::vector<std::string> wordList
    ) 
    {
    std::vector<std::string> matches;
    std::string word = "";
    std::vector<int> tumblerMaxes;
    for(int i = 0; i < tumblerSets.size(); ++i)
    {
        tumblerMaxes.push_back(tumblerSets[i].size());
    }

    std::vector<int> tumblerPositions;
    tumblerPositions.resize(tumblerMaxes.size());
    int tumblerPositionsSize = tumblerPositions.size();
    for(int i = 0; i < tumblerPositionsSize; ++i) {
        tumblerPositions[i] = 0;
    }

    int lastPos = tumblerSets.size() - 1;
    int currPos = lastPos;
    bool carriedOne = false;
    while(currPos >= 0)
    {   
        std::string curr_word = print_code(tumblerSets, tumblerPositions);
        std::cout << curr_word << "\n";
        if(is_word(curr_word, wordList)) {
            matches.push_back(curr_word);
        }
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

int main() 
{
    std::vector<std::string> wordList = import_file(std::string("dictionary.txt"));
    std::vector<std::vector<char>> tumblerSets;
    int numLetters = 0;
    while (
        std::cout << "Enter number of letters in word (0 to quit): " &&
        std::cin >> numLetters &&
        numLetters > 0
    ) 
    {
        tumblerSets = generateTumblers(numLetters);
        
        std::vector<std::string> wordSets = get_matches(tumblerSets, wordList);
        std::cout << wordSets.size() << " words were found:\n------------------\n";
        for(int i = 0; i < wordSets.size(); ++i) {
            if(i > 10) {
                std::cout << "--truncated--";
                break;
            }
            std::cout << wordSets[i] << "\n";
        }
    }
    return 0;
}