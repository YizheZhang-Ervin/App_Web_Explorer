var app = new Vue({
    el: '#app',
    data() {
        return {
            menuOpen: "1",
            input: "",
            output: "",
            currentNode: "",
            selectOptions: [{
                value: 'js',
                label: 'NodeJS'
              }, {
                value: 'shell',
                label: 'Shell'
              }, {
                value: 'html',
                label: 'HTML'
                }
            ],
            selectValue: 'js'
        }
    },
    mounted() {
        this.addCell()
    },
    methods: {
        handleSelect(key, keyPath) {
            // console.log(key, keyPath);
        },
        addCell() {
            let center = document.getElementById("center");
            let cell = document.createElement("textarea");
            cell.className = "cell";
            cell.oninput = this.cellChange;
            cell.onfocus = this.cellChange;
            center.appendChild(cell);
        },
        delCell() {
            let center = document.getElementById("center");
            if (center.lastChild.nodeName === "PRE") {
                center.removeChild(center.lastChild);
            }
            center.removeChild(center.lastChild);
        },
        runCommon(url){
            axios.post(`http://127.0.0.1:3000/api/${url}/`, { key: JSON.stringify(this.input) })
                .then((response) => {
                    if (response.data.error == "error") {
                        console.log("bakend error");
                    } else {
                        let center = document.getElementById("center");
                        this.output = response.data.result;
                        let pre = document.createElement("pre");
                        pre.className = "pre";
                        pre.innerHTML = this.output;
                        // 当前cell下方没有pre时
                        if (this.currentNode.nextSibling.nodeName!="PRE") {
                            // 当前节点的下方插入pre
                            this.insterAfter(pre,this.currentNode);
                            this.addCell();
                            // 当前cell下方有pre时
                        } else {
                            let oldpre = this.currentNode.nextSibling;
                            center.replaceChild(pre, oldpre);
                        }
                    }
                },
                    function (err) {
                        console.log(err.data);
                    }
                );
        },
        runCell() {
            // html处理
            if(this.selectValue=="html"){
                let center = document.getElementById("center");
                let parser = new DOMParser();
                let inputAdjust = "<div id='div001' >"+this.input+"</div>"
                var newDoc=parser.parseFromString(inputAdjust, "text/xml");
                center.replaceChild(newDoc.getElementById("div001"),this.currentNode);
            // js、shell处理
            }else{
                this.runCommon(this.selectValue);
            }
            
        },
        cellChange(e) {
            this.input = e.target.value;
            this.currentNode = e.target;
            // 自适应大小
            let content = this.input.split("\n");
            this.currentNode.setAttribute("rows", content.length + 1);
        },
        insterAfter(newElement,targetElement){
            var parent = targetElement.parentNode;
            // 先找父级元素，若目标元素为最后一个元素，直接append到父级末尾
            if(parent.lastChild == targetElement){
                  parent.appendChild(newElement);
            }
            // 如果不是，则利用insertBefore插入到目标元素的下一个元素的前面
            else{
                  parent.insertBefore(newElement,targetElement.nextSibling);
            }              
       }
    }
});