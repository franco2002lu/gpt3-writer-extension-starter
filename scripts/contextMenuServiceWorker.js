//const GITHUB_ORIGIN = 'https://github.com';


// const sendMessage = (content) => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         const activeTab = tabs[0].id;
//
//         chrome.tabs.sendMessage(
//             activeTab,
//             { message: "inject", content },
//             (response) => {
//                 if (response.status === "failed") {
//                     console.log("injection failed.");
//                 }
//             }
//         );
//     });
// };


const getKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
            if(result['openai-key']) {
                const decodedKey = atob(result['openai-key']);
                resolve(decodedKey);
            }
        });
    });
};

const displaySidebar = async (message) => {
    // logic to display whatever in message into google's sidebar.

}
const generate = async (prompt) => {
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';

    const completionResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 1250,
            temperature: 0.7,
        }),
    });
    const completion = await completionResponse.json();
    return completion.choices.pop();
}

// New function here
const generateCompletionAction = async (info) => {
    try {
        await chrome.runtime.sendMessage({name: 'execute', data: {value: 'Generating...'}});

        const { selectionText } = info;
        const basePromptPrefix = "summarize the code below:\n";

        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);
        console.log(baseCompletion.text)
        await chrome.runtime.sendMessage({
            name: 'execute',
            data: {value: baseCompletion.text.replace(/(\r\n|\n|\r)/gm, "")}
        });

    } catch (error) {
        console.log(error);
    }
};

// It is created in the contextMenu after it is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'context-run',
        title: 'Generate code description',
        contexts: ['selection'],
    });
});


//chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error)); //fixme: not sure if works
// the code above opens side panel when the the popup icon is clicked
// instead what we want is for it to open when the icon in dropdown menu is clicked


// when clicked in the menu it starts executing
chrome.contextMenus.onClicked.addListener(generateCompletionAction);
