import * as speechCommands from '@tensorflow-models/speech-commands';
import * as tfvis from '@tensorflow/tfjs-vis';

// 指向静态服务器的地址
const MODEL_PATH = 'http://127.0.0.1:5500'

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
    MODEL_PATH + './speech/metadata.json'
  )
  // 确保加载完成
  await recognizer.ensureModelLoaded()
}