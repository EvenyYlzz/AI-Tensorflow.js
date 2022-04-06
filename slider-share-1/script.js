import '@babel/polyfill'
import * as speechCommands from '@tensorflow-models/speech-commands'

// 指向静态服务器的地址
const MODEL_PATH = 'http://127.0.0.1:8080'

// 为了方便复用定一个迁移学习器变量
let transferRecognizer

window.onload = async () => {
  // 创建识别器
  const recognizer = speechCommands.create(
    // 参数1: 浏览器的FFT（傅立叶变换）
    'BROWSER_FFT',
    // 参数2: 词汇 （用空、使用默认的即可）
    null,
    // 参数3: 自定义模型的Url
    MODEL_PATH + '/speech/model.json',
    // 参数4: 源信息的Url
    MODEL_PATH + '/speech/metadata.json'
  )
  // 确保加载完成
  await recognizer.ensureModelLoaded()
  transferRecognizer = recognizer.createTransfer('轮播图') // 创建迁移学习器，接收一个参数，name进行命名
}

window.collect = async (btn) => {
  btn.disabled = true
  const label = btn.innerText
  // _background_noise_ 包内参数
  // 收集声音
  await transferRecognizer.collectExample(
    label === '背景噪音' ? '_background_noise_' : label
  )
  btn.disabled = false
  document.querySelector('#count').innerHTML = JSON.stringify(transferRecognizer.countExamples(), null, 2)
  // 查看数据收集情况
  console.log(transferRecognizer.countExamples())
}