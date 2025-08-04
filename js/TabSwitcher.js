const tabs = document.querySelectorAll('.tab-sct')
const tabButtons = document.querySelectorAll('.tab-btn')
const startingTab = 0

function hideAll() {
    tabs.forEach((tab) => {
        tab.style.display = 'none'
    })
}

function toggleTab(tabName) {
    hideAll()
    tabs.forEach((tab) => {
        if (tab.id === tabName) {
            tab.style.display = 'block'
        }
    })
    
    tabButtons.forEach((button) => {
        button.classList.remove('active')
        if (button.id + '-sct' === tabName) {
            button.classList.add('active')
        }
    })
}

export function initTabs() {
    hideAll()
    tabs[startingTab].style.display = 'block'
    tabButtons[startingTab].classList.add('active')

    tabButtons.forEach((button) => {
        const compositeName = button.id + '-sct'
        button.addEventListener('click', () => toggleTab(compositeName))
    })
}