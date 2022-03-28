import '@babel/polyfill'
import * as speechCommands from '@tensorflow-models/speech-commands'

const MODEL_PATH = 'http://127.0.0.1:8080'

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
  
  const res = await fetch(MODEL_PATH + '/slider/data.bin')
  const arrayBuffer = await res.arrayBuffer()

  // 迁移学习器加载数据
  transferRecognizer.loadExamples(arrayBuffer)
  // 查看数据收集情况
  console.log(transferRecognizer.countExamples())
  
  // 拿到数据之后还是要先训练
  await transferRecognizer.train({ epochs: 30 })
  console.log('train done')
}

window.toggle = async (checked) => {
  if (checked) {
    // 第一个参数是回调，第二个参数可以传一些配置参数
    await transferRecognizer.listen(result => {
      // scores是一个数组，包含了识别出的所有词组的得分情况
      const { scores } = result;
      // 
      const labels = transferRecognizer.wordLabels()
      const index = scores.indexOf(Math.max(...scores))
      console.log('本次识别指令结果为：', labels[index])
    },
    {
      // 控制识别频率 （0～1）
      overlapFactor: 0,
      // 可能性阈值（也就是识别的标准）标准低，可能误识别
      probabilityThreshold: 0.5
    })
  } else {
    transferRecognizer.stopListening()
  }
}