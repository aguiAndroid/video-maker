const algorithmiaApiKey = require('./credentials/algorithmia.json').apiKey
const algorithmia = require('algorithmia')
const sentenceBoundaryDetection = require('sbd')
async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated =  algorithmia(algorithmiaApiKey)
        const WikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const WikipediaResponse = await WikipediaAlgorithm.pipe(content.searchTerm)
        const wikiPediaContent = WikipediaResponse.get()
        content.sourceContentOriginal = wikiPediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDateInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
        content.sourceContentSanitized = withoutDateInParentheses
        
        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')
            
            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if ( line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

    function breakContentIntoSentences(content) {
        content.sentences = []
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
       console.log(content)
        
    }
}

module.exports = robot