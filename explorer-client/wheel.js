export default {
    props: {
    },
    watch: {
    },
    mounted() {
        this.init()
    },
    data() {
        return {
            myLucky: undefined,
            width: '300px',
            height: '300px',
            blocks: [{ padding: '10px', background: '#617df2' }],
            prizes: [
                { background: '#e9e8fe', fonts: [{ text: '0' }] },
                { background: '#b8c5f2', fonts: [{ text: '1' }] },
                { background: '#e9e8fe', fonts: [{ text: '2' }] },
                { background: '#b8c5f2', fonts: [{ text: '3' }] },
                { background: '#e9e8fe', fonts: [{ text: '4' }] },
                { background: '#b8c5f2', fonts: [{ text: '5' }] },
                { background: '#e9e8fe', fonts: [{ text: '6' }] },
                { background: '#b8c5f2', fonts: [{ text: '7' }] },
            ],
            buttons: [{
                radius: '35%',
                background: '#8a9bf3',
                pointer: true,
                fonts: [{ text: '开始', top: '-10px' }]
            }],
        }
    },
    methods: {
        init() {
            this.myLucky = new LuckyCanvas.LuckyWheel('#my-lucky', {
                width: this.width,
                height: this.height,
                blocks: this.blocks,
                prizes: this.prizes,
                buttons: this.buttons,
                start: this.start
            })
        },
        start() {
            // 开始游戏
            this.myLucky.play()
            // 使用定时器模拟接口
            setTimeout(() => {
                // 结束游戏
                // console.log(myLucky.prizes.length)
                let randomInt = Math.floor(Math.random() * this.myLucky.prizes.length + 0)
                // console.log(randomInt)
                this.myLucky.stop(randomInt)
            }, 3000)
        }
    },
    template:
        `
    <section>
        <div id="my-lucky"></div>
    </section>
    `
}