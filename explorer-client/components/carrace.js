export default {
    props: {
    },
    watch: {
    },
    mounted() {
    },
    data() {
        return {
            canvas: null,
            ctx: null,
            canvas2: null,
            ctx2: null,
            colors: {
                sky: "#D4F5FE",
                mountains: "#83CACE",
                ground: "#8FC04C",
                groundDark: "#73B043",
                road: "#606a7c",
                roadLine: "#FFF",
                hud: "#FFF"
            },
            settings: {
                fps: 60,
                skySize: 120,
                ground: {
                    size: 350,
                    min: 4,
                    max: 120
                },
                road: {
                    min: 76,
                    max: 700,
                }
            },
            state: {
                bgpos: 0,
                offset: 0,
                startDark: true,
                curve: 0,
                currentCurve: 0,
                turn: 1,
                speed: 27,
                xpos: 0,
                section: 50,
                car: {
                    maxSpeed: 50,
                    friction: 0.4,
                    acc: 0.85,
                    deAcc: 0.5
                },
                keypress: {
                    up: false,
                    left: false,
                    right: false,
                    down: false
                }
            },
            storage: {
                bg: null
            }
        }
    },
    methods: {
        init() {
            this.canvas = document.getElementById('canvas002')
            this.ctx = this.canvas.getContext('2d');
            this.canvas2 = document.createElement('canvas');
            this.canvas2.width = this.canvas.width;
            this.canvas2.height = this.canvas.height;
            this.ctx2 = this.canvas2.getContext('2d');
            window.addEventListener("keydown", this.keyDown, false);
            window.addEventListener("keyup", this.keyUp, false);
            this.drawBg();
            this.draw();
        },
        draw() {
            setTimeout(() => {
                this.calcMovement();
                //if(this.state.speed > 0) {
                this.state.bgpos += (this.state.currentCurve * 0.02) * (this.state.speed * 0.2);
                this.state.bgpos = this.state.bgpos % this.canvas.width;
                this.ctx.putImageData(this.storage.bg, this.state.bgpos, 5);
                this.ctx.putImageData(this.storage.bg, this.state.bgpos > 0 ? this.state.bgpos - this.canvas.width : this.state.bgpos + this.canvas.width, 5);
                //}

                this.state.offset += this.state.speed * 0.05;
                if (this.state.offset > this.settings.ground.min) {
                    this.state.offset = this.settings.ground.min - this.state.offset;
                    this.state.startDark = !this.state.startDark;
                }
                this.drawGround(this.ctx, this.state.offset, this.colors.ground, this.colors.groundDark, this.canvas.width);

                this.drawRoad(this.settings.road.min + 6, this.settings.road.max + 36, 10, this.colors.roadLine);
                this.drawGround(this.ctx2, this.state.offset, this.colors.roadLine, this.colors.road, this.canvas.width);
                this.drawRoad(this.settings.road.min, this.settings.road.max, 10, this.colors.road);
                this.drawRoad(3, 24, 0, this.ctx.createPattern(this.canvas2, 'repeat'));
                this.drawCar();
                this.drawHUD(this.ctx, 630, 340, this.colors.hud);
                requestAnimationFrame(this.draw);
            }, 1000 / this.settings.fps);
        },
        drawHUD(ctx, centerX, centerY, color) {
            var radius = 50,
                tigs = [0, 90, 135, 180, 225, 270, 315],
                angle = 90;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            ctx.lineWidth = 7;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.stroke();

            for (var i = 0; i < tigs.length; i++) {
                this.drawTig(ctx, centerX, centerY, radius, tigs[i], 7);
            }

            // draw pointer
            angle = this.map(this.state.speed, 0, this.state.car.maxSpeed, 90, 360);
            this.drawPointer(ctx, color, 50, centerX, centerY, angle);
        },
        drawPointer(ctx, color, radius, centerX, centerY, angle) {
            var point = this.getCirclePoint(centerX, centerY, radius - 20, angle),
                point2 = this.getCirclePoint(centerX, centerY, 2, angle + 90),
                point3 = this.getCirclePoint(centerX, centerY, 2, angle - 90);

            ctx.beginPath();
            ctx.strokeStyle = "#FF9166";
            ctx.lineCap = 'round';
            ctx.lineWidth = 4;
            ctx.moveTo(point2.x, point2.y);
            ctx.lineTo(point.x, point.y);
            ctx.lineTo(point3.x, point3.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(centerX, centerY, 9, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
        },
        drawTig(ctx, x, y, radius, angle, size) {
            var startPoint = this.getCirclePoint(x, y, radius - 4, angle),
                endPoint = this.getCirclePoint(x, y, radius - size, angle)

            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
        },
        getCirclePoint(x, y, radius, angle) {
            var radian = (angle / 180) * Math.PI;
            return {
                x: x + radius * Math.cos(radian),
                y: y + radius * Math.sin(radian)
            }
        },
        calcMovement() {
            var move = this.state.speed * 0.01,
                newCurve = 0;

            if (this.state.keypress.up) {
                this.state.speed += this.state.car.acc - (this.state.speed * 0.015);
            } else if (this.state.speed > 0) {
                this.state.speed -= this.state.car.friction;
            }

            if (this.state.keypress.down && this.state.speed > 0) {
                this.state.speed -= 1;
            }
            // Left and right
            this.state.xpos -= (this.state.currentCurve * this.state.speed) * 0.005;
            if (this.state.speed) {
                if (this.state.keypress.left) {
                    this.state.xpos += (Math.abs(this.state.turn) + 7 + (this.state.speed > this.state.car.maxSpeed / 4 ? (this.state.car.maxSpeed - (this.state.speed / 2)) : this.state.speed)) * 0.2;
                    this.state.turn -= 1;
                }
                if (this.state.keypress.right) {
                    this.state.xpos -= (Math.abs(this.state.turn) + 7 + (this.state.speed > this.state.car.maxSpeed / 4 ? (this.state.car.maxSpeed - (this.state.speed / 2)) : this.state.speed)) * 0.2;
                    this.state.turn += 1;
                }
                if (this.state.turn !== 0 && !this.state.keypress.left && !this.state.keypress.right) {
                    this.state.turn += this.state.turn > 0 ? -0.25 : 0.25;
                }
            }
            this.state.turn = this.clamp(this.state.turn, -5, 5);
            this.state.speed = this.clamp(this.state.speed, 0, this.state.car.maxSpeed);
            // section
            this.state.section -= this.state.speed;
            if (this.state.section < 0) {
                this.state.section = this.randomRange(1000, 9000);
                newCurve = this.randomRange(-50, 50);
                if (Math.abs(this.state.curve - newCurve) < 20) {
                    newCurve = this.randomRange(-50, 50);
                }
                this.state.curve = newCurve;
            }
            if (this.state.currentCurve < this.state.curve && move < Math.abs(this.state.currentCurve - this.state.curve)) {
                this.state.currentCurve += move;
            } else if (this.state.currentCurve > this.state.curve && move < Math.abs(this.state.currentCurve - this.state.curve)) {
                this.state.currentCurve -= move;
            }
            if (Math.abs(this.state.xpos) > 550) {
                this.state.speed *= 0.96;
            }
            this.state.xpos = this.clamp(this.state.xpos, -650, 650);
        },
        keyUp(e) {
            this.move(e, false);
        },
        keyDown(e) {
            this.move(e, true);
        },
        move(e, isKeyDown) {
            if (e.keyCode >= 37 && e.keyCode <= 40) {
                e.preventDefault();
            }

            if (e.keyCode === 37) {
                this.state.keypress.left = isKeyDown;
            }

            if (e.keyCode === 38) {
                this.state.keypress.up = isKeyDown;
            }

            if (e.keyCode === 39) {
                this.state.keypress.right = isKeyDown;
            }

            if (e.keyCode === 40) {
                this.state.keypress.down = isKeyDown;
            }
        },
        randomRange(min, max) {
            return min + Math.random() * (max - min);
        },
        norm(value, min, max) {
            return (value - min) / (max - min);
        },
        lerp(norm, min, max) {
            return (max - min) * norm + min;
        },
        map(value, sourceMin, sourceMax, destMin, destMax) {
            return this.lerp(this.norm(value, sourceMin, sourceMax), destMin, destMax);
        },
        clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },
        drawBg() {
            this.ctx.fillStyle = this.colors.sky;
            this.ctx.fillRect(0, 0, this.canvas.width, this.settings.skySize);
            this.drawMountain(0, 60, 200);
            this.drawMountain(280, 40, 200);
            this.drawMountain(400, 80, 200);
            this.drawMountain(550, 60, 200);

            this.storage.bg = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        },
        drawMountain(pos, height, width) {
            this.ctx.fillStyle = this.colors.mountains;
            this.ctx.strokeStyle = this.colors.mountains;
            this.ctx.lineJoin = "round";
            this.ctx.lineWidth = 20;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.settings.skySize);
            this.ctx.lineTo(pos + (width / 2), this.settings.skySize - height);
            this.ctx.lineTo(pos + width, this.settings.skySize);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
        },
        drawSky() {
            this.ctx.fillStyle = this.colors.sky;
            this.ctx.fillRect(0, 0, this.canvas.width, this.settings.skySize);
        },
        drawRoad(min, max, squishFactor, color) {
            var basePos = this.canvas.width + this.state.xpos;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(((basePos + min) / 2) - (this.state.currentCurve * 3), this.settings.skySize);
            this.ctx.quadraticCurveTo((((basePos / 2) + min)) + (this.state.currentCurve / 3) + squishFactor, this.settings.skySize + 52, (basePos + max) / 2, this.canvas.height);
            this.ctx.lineTo((basePos - max) / 2, this.canvas.height);
            this.ctx.quadraticCurveTo((((basePos / 2) - min)) + (this.state.currentCurve / 3) - squishFactor, this.settings.skySize + 52, ((basePos - min) / 2) - (this.state.currentCurve * 3), this.settings.skySize);
            this.ctx.closePath();
            this.ctx.fill();
        },
        drawCar() {
            var carWidth = 160,
                carHeight = 50,
                carX = (this.canvas.width / 2) - (carWidth / 2),
                carY = 320;
            // shadow
            this.roundedRect(this.ctx, "rgba(0, 0, 0, 0.35)", carX - 1 + this.state.turn, carY + (carHeight - 35), carWidth + 10, carHeight, 9);
            // tires
            this.roundedRect(this.ctx, "#111", carX, carY + (carHeight - 30), 30, 40, 6);
            this.roundedRect(this.ctx, "#111", (carX - 22) + carWidth, carY + (carHeight - 30), 30, 40, 6);
            this.drawCarBody(this.ctx);
        },
        drawCarBody(ctx) {
            var startX = 299, startY = 311,
                lights = [10, 26, 134, 152],
                lightsY = 0;
            /* Front */
            this.roundedRect(this.ctx, "#C2C2C2", startX + 6 + (this.state.turn * 1.1), startY - 18, 146, 40, 18);
            ctx.beginPath();
            ctx.lineWidth = "12";
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#FFFFFF";
            ctx.moveTo(startX + 30, startY);
            ctx.lineTo(startX + 46 + this.state.turn, startY - 25);
            ctx.lineTo(startX + 114 + this.state.turn, startY - 25);
            ctx.lineTo(startX + 130, startY);
            ctx.fill();
            ctx.stroke();
            /* END: Front */
            ctx.lineWidth = "12";
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.fillStyle = "#DEE0E2";
            ctx.strokeStyle = "#DEE0E2";
            ctx.moveTo(startX + 2, startY + 12 + (this.state.turn * 0.2));
            ctx.lineTo(startX + 159, startY + 12 + (this.state.turn * 0.2));
            ctx.quadraticCurveTo(startX + 166, startY + 35, startX + 159, startY + 55 + (this.state.turn * 0.2));
            ctx.lineTo(startX + 2, startY + 55 - (this.state.turn * 0.2));
            ctx.quadraticCurveTo(startX - 5, startY + 32, startX + 2, startY + 12 - (this.state.turn * 0.2));
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = "12";
            ctx.fillStyle = "#DEE0E2";
            ctx.strokeStyle = "#DEE0E2";
            ctx.moveTo(startX + 30, startY);
            ctx.lineTo(startX + 40 + (this.state.turn * 0.7), startY - 15);
            ctx.lineTo(startX + 120 + (this.state.turn * 0.7), startY - 15);
            ctx.lineTo(startX + 130, startY);
            ctx.fill();
            ctx.stroke();

            this.roundedRect(ctx, "#474747", startX - 4, startY, 169, 10, 3, true, 0.2);
            this.roundedRect(ctx, "#474747", startX + 40, startY + 5, 80, 10, 5, true, 0.1);

            ctx.fillStyle = "#FF9166";

            lights.forEach((xPos) => {
                ctx.beginPath();
                ctx.arc(startX + xPos, startY + 20 + lightsY, 6, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
                lightsY += this.state.turn * 0.05;
            });

            ctx.lineWidth = "9";
            ctx.fillStyle = "#222222";
            ctx.strokeStyle = "#444";

            this.roundedRect(this.ctx, "#FFF", startX + 60, startY + 25, 40, 18, 3, true, 0.05);
        },
        roundedRect(ctx, color, x, y, width, height, radius, turn, turneffect) {
            var skew = turn === true ? this.state.turn * turneffect : 0;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x + radius, y - skew);

            // top right
            ctx.lineTo(x + width - radius, y + skew);
            ctx.arcTo(x + width, y + skew, x + width, y + radius + skew, radius);
            ctx.lineTo(x + width, y + radius + skew);

            // down right
            ctx.lineTo(x + width, (y + height + skew) - radius);
            ctx.arcTo(x + width, y + height + skew, (x + width) - radius, y + height + skew, radius);
            ctx.lineTo((x + width) - radius, y + height + skew);

            // down left
            ctx.lineTo(x + radius, y + height - skew);
            ctx.arcTo(x, y + height - skew, x, (y + height - skew) - radius, radius);
            ctx.lineTo(x, (y + height - skew) - radius);

            // top left
            ctx.lineTo(x, y + radius - skew);
            ctx.arcTo(x, y - skew, x + radius, y - skew, radius);
            ctx.lineTo(x + radius, y - skew);
            ctx.fill();
        },
        drawGround(ctx, offset, lightColor, darkColor, width) {
            var pos = (this.settings.skySize - this.settings.ground.min) + offset, stepSize = 1, drawDark = this.state.startDark, firstRow = true;
            ctx.fillStyle = lightColor;
            ctx.fillRect(0, this.settings.skySize, width, this.settings.ground.size);

            ctx.fillStyle = darkColor;
            while (pos <= this.canvas.height) {
                stepSize = this.norm(pos, this.settings.skySize, this.canvas.height) * this.settings.ground.max;
                if (stepSize < this.settings.ground.min) {
                    stepSize = this.settings.ground.min;
                }

                if (drawDark) {
                    if (firstRow) {
                        ctx.fillRect(0, this.settings.skySize, width, stepSize - (offset > this.settings.ground.min ? this.settings.ground.min : this.settings.ground.min - offset));
                    } else {
                        ctx.fillRect(0, pos < this.settings.skySize ? this.settings.skySize : pos, width, stepSize);
                    }
                }

                firstRow = false;
                pos += stepSize;
                drawDark = !drawDark;
            }
        }
    },
    template:
        `
        <section>
            <button class="btn btn-success" @click="init">Start</button>
            <canvas height="450" width="750" id="canvas002"></canvas>
        </section>
    `
}