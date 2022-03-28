import '@babel/polyfill'
import * as speechCommands from '@tensorflow-models/speech-commands'
import * as tfvis from '@tensorflow/tfjs-vis'

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

window.train = async () => {
  // 调用迁移学习器的train方法
  await transferRecognizer.train({
    // 超参数，可以简单得理解为把同样的数据反复过多少遍
    epochs: 30,
    // 回调进行训练模型可视化
    callback: tfvis.show.fitCallbacks(
      // contain内容
      { name: '训练效果' },
      // 度量   损失和精确度
      ['loss', 'acc'],
      { callbacks: ['onEpochEnd'] }
    )
  })
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


window.save = () => {
  // 将js的array buffer格式的数据转化为二进制文件保存
  const arrayBuffer = transferRecognizer.serializeExamples()
  // 首先转为blog格式
  const blob = new Blob([arrayBuffer])
  // 通过创建a标签指向下载链接，然后触发点击下载
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = 'data.bin'
  link.click()
}