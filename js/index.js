import {initTabs} from './TabSwitcher.js'
import {initGallery} from './Gallery.js'

function init(){
    initTabs()
    initGallery()
}

document.addEventListener('DOMContentLoaded', init)