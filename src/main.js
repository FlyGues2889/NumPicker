import { createApp } from "vue";
import App from "./App.vue";

import 'mdui/mdui.css';
import 'mdui';

import './css/font.css'
import './css/fonts/material-symbols/index.css'

import listContainer from "./components/list-container.vue";
import historyChip from "./components/history-chip.vue";

createApp(App).mount("#app");

App.component("list-container", listContainer);
App.component("history-chip", historyChip);
