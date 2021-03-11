var app = new Vue({
    el: '#app',
    data() {
        return {
            menuOpen: "1",
            input: "",
            output: "",
            currentNode: ""
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
                        if (!this.currentNode.nextSibling) {
                            center.appendChild(pre);
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
        runJS() {
            this.runCommon("js");
        },
        runShell(){
            this.runCommon("shell");
        },
        cellChange(e) {
            this.input = e.target.value;
            this.currentNode = e.target;
            // 自适应大小
            let content = this.input.split("\n");
            this.currentNode.setAttribute("rows", content.length + 2);
        }
    }
});