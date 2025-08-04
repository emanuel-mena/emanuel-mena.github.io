import {initTabs} from './TabSwitcher.js'
import {initGallery} from './gallery.js'

function init(){
    initTabs()
    initGallery()
}

document.addEventListener('DOMContentLoaded', init)