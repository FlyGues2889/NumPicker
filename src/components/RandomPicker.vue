<template>
    <div class="bkg">
        <div class="container">
            <mdui-top-app-bar class="topBar">
                <mdui-top-app-bar-title>Num Picker</mdui-top-app-bar-title>

                <div style="flex-grow: 1"></div>

                <mdui-button-icon id="titlebar-minimize" @click="minimizeWindow">
                    <span class="material-symbols-rounded">minimize</span>
                </mdui-button-icon>
                <mdui-button-icon id="titlebar-maximize" @click="maximizeWindow">
                    <span class="material-symbols-rounded" style="font-size: 1.2rem;">crop_square</span>
                </mdui-button-icon>
                <mdui-button-icon id="titlebar-close" @click="closeWindow">
                    <span class="material-symbols-rounded">close</span>
                </mdui-button-icon>
            </mdui-top-app-bar>


            <mdui-tabs value="pick" placement="top-start">
                <mdui-tab value="pick" inline>
                    <span slot="icon" class="material-symbols-rounded">touch_app</span>
                    &nbsp;抽取
                </mdui-tab>
                <mdui-tab value="history" inline>
                    <span slot="icon" class="material-symbols-rounded">history</span>
                    &nbsp;历史
                </mdui-tab>

                <mdui-button-icon class="info-btn" @click="openInfo">
                    <span class="material-symbols-rounded">info</span>
                </mdui-button-icon>

                <mdui-tab-panel slot="panel" value="pick" class="pick-panel">
                    <!-- 结果展示区 -->
                    <div class="result-section">
                        <!-- 单次抽取结果 / Done 状态 -->
                        <div v-if="displayResults.length === 0" class="result-number"
                            :class="{ 'rolling': isRolling, 'done': isPoolEmpty && !config.allowRepeat }">
                            {{ isPoolEmpty && !config.allowRepeat ? 'Done' : displayResult }}
                        </div>

                        <!-- 批量抽取结果 -->
                        <div v-else class="batch-results" :class="{ 'rolling': isRolling }">
                            <div v-for="(num, index) in displayResults" :key="index" class="batch-number">
                                {{ num }}
                            </div>
                        </div>
                    </div>

                    <div class="hint" v-if="!config.allowRepeat && config.batchCount > numberPool.length">
                        <mdui-button variant="outlined">
                            <span slot="icon" class="material-symbols-rounded">warning</span>
                            余数小于设定批量抽取数
                        </mdui-button>
                    </div>

                    <div class="lftToolBar">
                        <mdui-button @click="handleBatchDrawClick" variant="text" :disabled="isRolling">
                            <span slot="icon" class="material-symbols-rounded">control_point_duplicate</span>
                            批量
                        </mdui-button>
                    </div>
                    <mdui-fab id="pickBtn" class="mdui-fab" size="normal" @click="handleDrawClick" :disabled="isRolling"
                        :loading="isRolling">
                        <span slot="icon" class="material-symbols-rounded-fill">{{ isRolling ? 'stop' : 'touch_app'
                        }}</span>
                    </mdui-fab>
                    <div class="rgtToolBar">
                        <mdui-button @click="openDelpoy" variant="text" :disabled="isRolling">
                            <span slot="icon" class="material-symbols-rounded">instant_mix</span>
                            配置
                        </mdui-button>
                    </div>
                </mdui-tab-panel>
                <mdui-tab-panel slot="panel" value="history">
                    <!-- 当前数字池预览 -->
                    <ListContainer>
                        <mdui-list-item nonclickable>
                            <span slot="icon" class="material-symbols-rounded">home_storage</span>
                            抽取数字池
                            <span slot="description">共 {{ numberPool.length }} 个待抽取</span>
                        </mdui-list-item>
                        <mdui-list-item nonclickable class="pool-numbers">
                            <HistoryChip v-for="item in displayPoolNumbers" :key="item">{{ item }}</HistoryChip>
                            <HistoryChip v-if="hasMoreNumbers" style="background: #f3f4f6; color: #6b7280;">
                                +{{ hiddenCount }} 更多...
                            </HistoryChip>
                        </mdui-list-item>
                    </ListContainer>
                    <!-- 抽取历史记录 -->
                    <ListContainer>
                        <mdui-list-item nonclickable>
                            <span slot="icon" class="material-symbols-rounded">history</span>
                            抽取历史记录
                            <mdui-button slot="end-icon" variant="tonal" @click="clearHistory"
                                class="clear-history-btn">
                                <span class="material-symbols-rounded">delete</span>
                            </mdui-button>
                        </mdui-list-item>
                        <mdui-divider inset></mdui-divider>
                        <mdui-list-item v-for="(item, index) in history" :key="index" class="history-item" rounded>
                            <mdui-chip slot="icon" class="history-type" variant="outlined">{{ item.type }}</mdui-chip>
                            <span class="history-result" :key="items">
                                {{ item.numbers.join(', ') }}
                            </span>
                        </mdui-list-item>
                        <mdui-list-item v-if="history.length === 0" nonclickable disabled>
                            <span slot="description">暂无抽取历史记录</span>
                        </mdui-list-item>
                    </ListContainer>
                </mdui-tab-panel>
            </mdui-tabs>

            <mdui-dialog close-on-overlay-click class="deploy-dialog">
                <span slot="icon" class="material-symbols-rounded">instant_mix</span>
                <span slot="headline">抽取配置</span>

                <div class="dialogContainer" style="height: 20rem;">
                    <mdui-list-subheader>模式选择</mdui-list-subheader>
                    <ListContainer>
                        <mdui-radio-group :value="config.mode" @change="(e) => config.mode = e.target.value">
                            <mdui-list-item nonclickable>
                                <mdui-radio slot="icon" value="range"></mdui-radio>
                                范围模式
                                <span slot="description">指定范围内的数字，随机抽取</span>
                            </mdui-list-item>
                            <mdui-divider inset></mdui-divider>
                            <mdui-list-item nonclickable>
                                <mdui-radio slot="icon" value="specified"></mdui-radio>
                                指定数字模式
                                <span slot="description">指定具体的数字，随机抽取</span>
                            </mdui-list-item>
                        </mdui-radio-group>
                    </ListContainer>

                    <mdui-list-subheader>数字范围配置</mdui-list-subheader>
                    <ListContainer>
                        <!-- 范围模式 -->
                        <mdui-list-item nonclickable v-if="config.mode === 'range'">
                            <span slot="icon" class="material-symbols-rounded">arrow_range</span>
                            抽取范围
                            <div class="numRangeGroup" slot="end-icon">
                                <!-- 最小值 -->
                                <mdui-text-field label="最小值" type="number" :value="config.range.min"
                                    @change="(e) => { config.range.min = Number(e.target.value); resetRemainingPool(); }"></mdui-text-field>
                                -
                                <!-- 最大值 -->
                                <mdui-text-field label="最大值" type="number" :value="config.range.max"
                                    @change="(e) => { config.range.max = Number(e.target.value); resetRemainingPool(); }"></mdui-text-field>
                            </div>
                        </mdui-list-item>

                        <!-- 指定数字模式 -->
                        <mdui-list-item nonclickable v-if="config.mode === 'specified'" class="input-group">
                            <span slot="icon" class="material-symbols-rounded">format_list_numbered</span>
                            设置抽取数组
                            <span slot="description">逗号/空格分隔数字</span>
                            <mdui-text-field slot="end-icon" :value="config.specifiedNumbers"
                                @change="(e) => { config.specifiedNumbers = e.target.value; resetRemainingPool(); }"
                                placeholder="例如: 1, 3, 5, 7, 9"></mdui-text-field>
                        </mdui-list-item>

                        <!-- 排除数字 -->
                        <mdui-list-item nonclickable class="input-group">
                            <span slot="icon" class="material-symbols-rounded">block</span>
                            排除数字
                            <span slot="description">逗号/空格分隔数字</span>
                            <mdui-text-field slot="end-icon" :value="exclusionsInput"
                                @change="(e) => exclusionsInput = e.target.value"
                                placeholder="例如: 5, 15, 25"></mdui-text-field>
                        </mdui-list-item>

                        <mdui-divider inset></mdui-divider>

                        <!-- 允许重复抽取 (Checkbox) -->
                        <mdui-list-item nonclickable>
                            <mdui-checkbox slot="icon" :checked="config.allowRepeat"
                                @change="(e) => { config.allowRepeat = e.target.checked; resetRemainingPool(); }"></mdui-checkbox>
                            允许重复抽取
                            <span slot="description">允许在抽取数字池中重复抽取</span>
                        </mdui-list-item>
                    </ListContainer>

                    <mdui-list-subheader>抽取配置</mdui-list-subheader>
                    <ListContainer>
                        <!-- 批量抽取个数 -->
                        <mdui-list-item nonclickable>
                            <span slot="icon" class="material-symbols-rounded">control_point_duplicate</span>
                            批量抽取个数
                            <mdui-text-field slot="end-icon" type="number" :value="config.batchCount"
                                @input="(e) => config.batchCount = Number(e.target.value)" min="1"></mdui-text-field>
                        </mdui-list-item>
                    </ListContainer>
                </div>

                <mdui-button variant="text" slot="action" @click="saveToLocal">
                    <span slot="icon" class="material-symbols-rounded">save</span>
                    保存配置
                </mdui-button>
                <mdui-button variant="text" slot="action" @click="resetConfig">
                    <span slot="icon" class="material-symbols-rounded">reset_settings</span>
                    重置
                </mdui-button>
                <mdui-button variant="tonal" slot="action" @click="closeDeployDialog">
                    <span slot="icon" class="material-symbols-rounded">check</span>
                    确定
                </mdui-button>
            </mdui-dialog>

            <mdui-dialog close-on-overlay-click class="info-dialog">
                <span slot="icon" class="material-symbols-rounded">info</span>
                <span slot="headline" style="font-family: 'Nunito';font-weight: 800;">Num Picker</span>
                <span slot="description">Num Picker 是一个基于 Tauri 和 Vue.js 的随机数字抽取工具</span>

                <div class="dialogContainer">
                    <ListContainer>
                        <mdui-list-item nonclickable>
                            <span slot="icon" class="material-symbols-rounded">app_badging</span>
                            版本 1.0.0
                            <span slot="description">Made by Lvi_Fly</span>
                            <mdui-badge slot="end-icon" class="versionBadge">Preview Edition</mdui-badge>
                        </mdui-list-item>
                        <mdui-list-item nonclickable>
                            <span slot="icon" class="material-symbols-rounded">code</span>
                            项目地址
                            <span slot="description">https://github.com/FlyGues2889/NumPicker</span>
                        </mdui-list-item>

                        <mdui-divider inset></mdui-divider>

                        <mdui-list-item nonclickable>
                            <span slot="icon" class="material-symbols-rounded">lightbulb</span>
                            AI项目
                            <span slot="description">本项目有人工智能辅助开发</span>
                        </mdui-list-item>
                    </ListContainer>
                </div>
            </mdui-dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { generateNumberPool, drawRandomNumber, drawBatchNumbers } from '../utils/randomLogic';
import { saveConfig, loadConfig, exportConfig, importConfig, defaultConfig } from '../utils/configManager';
import ListContainer from './list-container.vue';
import HistoryChip from './history-chip.vue';

import { dialog } from "mdui/functions/dialog.js";
import { snackbar } from "mdui/functions/snackbar.js";
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

// 窗口控制函数
function minimizeWindow() {
    appWindow.minimize();
}

function maximizeWindow() {
    appWindow.toggleMaximize();
}

function closeWindow() {
    appWindow.close();
}

// 状态
const config = ref({
    ...defaultConfig,
    batchCount: 5,
    allowRepeat: false
});
const exclusionsInput = ref('');
const isRolling = ref(false);
const displayResult = ref('Null');
const displayResults = ref([]);

// 剩余数字池（用于不重复抽取追踪）
const remainingPool = ref([]);
// 抽取历史
const history = ref([]);

// 最多渲染的数字个数
const MAX_DISPLAY_COUNT = 100;

// 截取前 N 个数字用于显示
const displayPoolNumbers = computed(() => {
    return numberPool.value.slice(0, MAX_DISPLAY_COUNT);
});

// 判断是否有超出的数字
const hasMoreNumbers = computed(() => {
    return numberPool.value.length > MAX_DISPLAY_COUNT;
});

// 计算超出的数量
const hiddenCount = computed(() => {
    return numberPool.value.length - MAX_DISPLAY_COUNT;
});

// 计算属性：原始完整数字池
const fullNumberPool = computed(() => generateNumberPool(config.value));

// 计算属性：当前可用数字池
const numberPool = computed(() => {
    if (config.value.allowRepeat) {
        return fullNumberPool.value;
    }
    return remainingPool.value;
});

// 计算属性：是否池子已空（不重复模式）
const isPoolEmpty = computed(() => {
    return !config.value.allowRepeat && remainingPool.value.length === 0 && fullNumberPool.value.length > 0;
});

// 监听排除数字输入
watch(exclusionsInput, (val) => {
    config.value.exclusions = val
        .split(/[,\s]+/)
        .map(Number)
        .filter(n => !isNaN(n));
});

// 监听配置变化，重置剩余池子
// 监听所有会影响数字池的配置变化，立即重置剩余池子
watch(
    () => config.value,
    () => {
        resetRemainingPool();
    },
    { deep: true } // 开启深度监听，确保对象内部属性变化也能触发
);

// 初始化
onMounted(() => {
    const saved = loadConfig();
    config.value = { ...config.value, ...saved };
    exclusionsInput.value = config.value.exclusions.join(', ');
    resetRemainingPool();
});

// 重置剩余数字池
function resetRemainingPool() {
    remainingPool.value = [...fullNumberPool.value];
    displayResult.value = ' - ';
    displayResults.value = [];
}

// 添加历史记录
function addHistory(type, numbers) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    history.value.unshift({
        time: timeStr,
        type: type,
        numbers: numbers
    });
}

// 清空历史
function clearHistory() {
    dialog({
        headline: "清空历史记录",
        description: "确定要清空抽取历史记录吗？此操作无法撤销。",
        actions: [
            {
                text: "取消",
            },
            {
                text: "确定",
                onClick: () => {
                    history.value = [];

                    snackbar({
                        message: "抽取历史记录已清空",
                        autoCloseDelay: 1500,
                        placement: "bottom-end",
                    });
                },
            }
        ]
    });
}


function openDelpoy() {
    const deployDialog = document.querySelector('.deploy-dialog');
    deployDialog.open = true;
}

function closeDeployDialog() {
    const deployDialog = document.querySelector('.deploy-dialog');
    deployDialog.open = false;
}

function openInfo() {
    const infoDialog = document.querySelector('.info-dialog');
    infoDialog.open = true;
}

// 处理单次抽取点击
function handleDrawClick() {
    if (isPoolEmpty.value) {
        // 新一轮抽取
        resetRemainingPool();
        return;
    }
    startDraw();
}

// 处理批量抽取点击
function handleBatchDrawClick() {
    if (isPoolEmpty.value) {
        // 新一轮抽取
        resetRemainingPool();
        return;
    }
    startBatchDraw();
}

// 单次抽取
function startDraw() {
    if (numberPool.value.length === 0) return;

    displayResults.value = [];
    isRolling.value = true;
    let rollCount = 0;

    // 动画用的临时池子
    const tempPoolForAnimation = [...numberPool.value];

    const rollInterval = setInterval(() => {
        displayResult.value = tempPoolForAnimation[Math.floor(Math.random() * tempPoolForAnimation.length)];
        rollCount++;
        if (rollCount > 20) {
            clearInterval(rollInterval);
            isRolling.value = false;

            // 最终抽取
            let finalResult;
            if (config.value.allowRepeat) {
                finalResult = drawRandomNumber(numberPool.value);
            } else {
                const randomIndex = Math.floor(Math.random() * remainingPool.value.length);
                finalResult = remainingPool.value.splice(randomIndex, 1)[0];
            }

            displayResult.value = finalResult;
            addHistory('单次', [finalResult]);
        }
    }, 50);
}

// 批量抽取
function startBatchDraw() {
    if (numberPool.value.length === 0) return;
    if (config.value.batchCount <= 0) return;

    displayResult.value = ' - ';
    isRolling.value = true;

    let rollCount = 0;
    const rollInterval = setInterval(() => {
        displayResults.value = drawBatchNumbers(numberPool.value, Math.min(3, config.value.batchCount), true);
        rollCount++;
        if (rollCount > 15) {
            clearInterval(rollInterval);
            isRolling.value = false;

            // 最终抽取
            let finalResults;
            if (config.value.allowRepeat) {
                finalResults = drawBatchNumbers(numberPool.value, config.value.batchCount, true);
            } else {
                const count = Math.min(config.value.batchCount, remainingPool.value.length);
                finalResults = [];
                for (let i = 0; i < count; i++) {
                    const randomIndex = Math.floor(Math.random() * remainingPool.value.length);
                    finalResults.push(remainingPool.value.splice(randomIndex, 1)[0]);
                }
            }

            displayResults.value = finalResults;
            addHistory('批量', finalResults);
        }
    }, 80);
}

// 配置操作
function saveToLocal() {
    saveConfig(config.value);
    snackbar({
        message: "配置已保存！",
        autoCloseDelay: 1500,
        placement: "bottom-end",
    });
}

function resetConfig() {
    config.value = {
        ...defaultConfig,
        batchCount: 5,
        allowRepeat: false
    };
    exclusionsInput.value = '';
    displayResult.value = ' - ';
    displayResults.value = [];
    history.value = [];
    resetRemainingPool();
    saveToLocal();
}
</script>

<style scoped>
/* 禁止所有元素被选中 */
* {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

/* 允许以下元素被选中 */
input[type="text"],
input[type="number"],
.result-number,
.batch-number,
.pool-numbers,
.history-result {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
}

mdui-list-subheader {
    height: 1rem;
    margin: 0.5rem 0;

    font-size: 0.8rem;
    line-height: 1rem;
    color: rgb(var(--mdui-color-secondary));
    font-family: 'Harmony Sans SC M';
}

mdui-dialog {
    dialogContainer {
        width: 30rem;
        overflow: auto;

        scrollbar-width: thin;
        scrollbar-color: rgba(var(--mdui-color-secondary), 0.15) #00000000;

        mdui-list-item {
            width: 100% !important;
        }
    }
}

mdui-tabs::part(container) {
    margin-bottom: 0.5rem;
    background-color: unset;
}

mdui-tab-panel {
    height: calc(100vh - 9.5rem);
    max-width: 50rem;

    margin-top: 0.5rem;
    padding-right: 0.5rem;

    position: relative;
    left: 50%;
    transform: translate(-50%);

    overflow: auto;
}

.pick-panel {
    max-width: calc(100vw - 4rem);

}

span[slot="description"] {
    opacity: 0.8;
    color: rgb(var(--mdui-color-secondary));
    font-size: small;
}

mdui-list-item {
    background-color: unset;
}

mdui-top-app-bar {
    height: 3.2rem;

    z-index: 100;

    align-items: center;
    background-color: unset;
    color: rgb(var(--mdui-color-primary));

    -webkit-app-region: drag;

    mdui-top-app-bar-title {
        margin-left: 1.6rem;

        font-size: medium;
        user-select: none;

        color: rgb(var(--mdui-color-primary));

        font-family: 'Nunito';
        font-weight: 700;
    }

    mdui-button-icon {
        margin: 0;

        transform: scale(0.8);
        color: rgb(var(--mdui-color-primary));
    }

    #titlebar-close {
        margin-right: 1rem;
    }
}

mdui-button {
    transition: all, 0.2s;
}

mdui-button[disabled] {
    opacity: 0.4;
}

.bkg {
    width: 100vw;

    margin: 0;
    padding: 0;

    background-color: rgba(var(--mdui-color-primary-container), 0.3) !important;
    overflow-x: hidden;
}

.container {
    width: 100vw;

    position: fixed;
    bottom: 0;

    margin: 0;
    padding: 0;

    background: rgb(var(--mdui-color-surface));
    border-radius: var(--mdui-shape-corner-extra-large) var(--mdui-shape-corner-extra-large) 0 0;
    padding: 1rem 2.4rem;
    box-shadow: var(--mdui-elevation-level5);
}

.result-section {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    display: flex;
    flex-direction: column;
    align-items: center;
}

.result-number {
    font-family: 'Nunito';
    font-size: 24vh;
    font-weight: 700;
    color: rgb(var(--mdui-color-secondary));
    transition: all 0.3s;
}

.batch-results {
    width: calc(100vw - 5.4rem);
    height: calc(100vh - 14rem);
    margin-bottom: 1rem;
    margin-top: -4rem;

    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    align-items: center;

    overflow: auto;
}

.batch-number {
    min-width: 4rem;
    padding: 0.5rem 1.5rem;

    font-family: 'Nunito';
    font-size: 10vh;
    font-weight: 800;
    color: rgb(var(--mdui-color-secondary));
    background: rgb(var(--mdui-color-surface-container));
    border-radius: var(--mdui-shape-corner-extra-large);
    border: 0.1rem solid rgba(var(--mdui-color-secondary), 0.1);
    text-align: center;
}

#pickBtn {
    position: fixed;
    bottom: 0.25rem;
    right: 50%;
    transform: translateX(50%);
}

.hint {
    height: 1.2rem;

    display: flex;
    align-items: center;
    margin-top: 1rem;

    position: absolute;
    left: -1.2rem;
    bottom: 1.25rem;

    mdui-button {
        transform: scale(0.8);
        color: rgb(var(--mdui-color-error));
        background-color: rgb(var(--mdui-color-error), 0.1);
    }
}

.pool-numbers {
    max-height: 10rem;
    overflow: auto;
}

.clear-history-btn {
    transition: all 0.2s;
}

.clear-history-btn:hover {
    background-color: rgb(var(--mdui-color-error));
    color: rgb(var(--mdui-color-surface));
}

.history-item {
    padding: 0.8rem;
    margin-top: 0.5rem;

    display: flex;
    gap: 1rem;
    align-items: center;
}

.history-type {
    color: rgb(var(--mdui-color-secondary));
    font-size: small;
}

.history-result {
    max-width: calc(101vw - 14rem);
    color: rgb(var(--mdui-color-secondary));
}

.lftToolBar {
    position: fixed;
    bottom: 0.25rem;
    left: 36.8%;
    transform: translateX(-50%);

    mdui-button {
        color: rgb(var(--mdui-color-secondary));
    }
}

.rgtToolBar {
    position: fixed;
    bottom: 0.25rem;
    right: 36%;
    transform: translateX(50%);

    mdui-button {
        color: rgb(var(--mdui-color-secondary));
    }
}

.numRangeGroup {
    mdui-text-field {
        width: 8rem;
    }
}

.info-btn {
    position: absolute;
    right: 0.5rem;
    bottom: 0;

    color: rgb(var(--mdui-color-secondary));
}

#titlebar-close {
    transition: all, 0.2s;
}

#titlebar-close:hover {
    background-color: rgb(var(--mdui-color-error));
    color: rgb(var(--mdui-color-surface));
}
.versionBadge{
    height: 1.4rem;
    padding: 0.6rem;

    background-color: rgb(var(--mdui-color-secondary));
    font-family: 'Nunito';
}
</style>