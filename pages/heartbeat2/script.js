const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const IMAGE_ENlLARGE = 11;            // 放大比例
const HEART_COLOR = "#ff7171";        // 心的颜色

/**
 * [min, max) 之间的均匀分布
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function randomUniform(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * [min, max] 之间的随机整数
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function randomInt(min, max) {
    return Math.trunc(Math.random() * (max - min + 1)) + min;
}


/**
 * 从数组中随机选择一个元素
 * @param {any[]} list
 * @return {any}
 */
function randomChoice(list) {
    return list[randomInt(0, list.length - 1)];
}

/**
 * 爱心函数生成器
 * @param {number} t 参数
 * @param {number} shrinkRatio 放大比例
 * @return {[number, number]} 新坐标
 */
function heartFunc(t, shrinkRatio = IMAGE_ENlLARGE) {
    let x = 16 * (Math.sin(t) ** 3);
    let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    x *= shrinkRatio;
    y *= shrinkRatio;
    x += CENTER_X;
    y += CENTER_Y;
    return [Math.trunc(x), Math.trunc(y)];
}

/**
 * 随机内部扩散
 * @param {number} x
 * @param {number} y
 * @param {number} beta 强度
 * @return {[number, number]} 新坐标
 */
function scatterInside(x, y, beta = 0.15) {
    const ratioX = - beta * Math.log(Math.random());
    const ratioY = - beta * Math.log(Math.random());
    const dx = ratioX * (x - CENTER_X);
    const dy = ratioY * (y - CENTER_Y);
    return [x - dx, y - dy];
}

/**
 * 抖动
 * @param {number} x
 * @param {number} y
 * @param {number} ratio 比例
 * @return {[number, number]} 新坐标
 */
function shrink(x, y, ratio) {
    const force = -1 / (((x - CENTER_X) ** 2 + (y - CENTER_Y) ** 2) ** 0.6);
    const dx = ratio * force * (x - CENTER_X)
    const dy = ratio * force * (y - CENTER_Y)
    return [x - dx, y - dy];
}

/**
 * 自定义曲线函数，调整跳动周期
 * @param {number} p 参数
 * @return {number} 正弦
 */
function curve(p) {
    // 可以尝试换其他的动态函数，达到更有力量的效果（贝塞尔？）
    return 2 * (3 * Math.sin(4 * p)) / (2 * Math.PI);
}

/**
 * 不重复的添加point
 * @param {[number, number][]} points
 * @param {[number, number]} point
 */
function addPointUnique(points, point) {
    for (const p of points) {
        if (p[0] === point[0] && p[1] === point[1])
            return;
    }
    points.push(point);
}

class Heart {
    constructor(generateFrame=20) {
        this.points = [];                       // 原始爱心坐标集合
        this.edgeDiffusionPoints = [];          // 边缘扩散效果点坐标集合
        this.centerDiffusionPoints = [];        // 中心扩散效果点坐标集合
        this.allPoints = {};                    // 每帧动态点坐标
        this.build(2000);
        // this.randomHalo = 1000;
        this.generateFrame = generateFrame;
        for (let i = 0; i < generateFrame; i++) {
            this.calc(i);
        }
    }

    build(number) {
        // 爱心
        for (let i = 0; i < number; i++) {
            const t = randomUniform(0, 2 * Math.PI);
            const [x, y] = heartFunc(t);
            addPointUnique(this.points, [x, y]);
        }
        // 爱心内扩散
        for (const [_x, _y] of this.points) {
            for (let i = 0; i < 3; i++) {
                const [x, y] = scatterInside(_x, _y, 0.05);
                addPointUnique(this.edgeDiffusionPoints, [x, y]);
            }
        }
        // 爱心内再次扩散
        for (let i = 0; i < 4000; i++) {
            let [x, y] = randomChoice(this.points);
            [x, y] = scatterInside(x, y, 0.17);
            addPointUnique(this.centerDiffusionPoints, [x, y]);
        }
    }

    /**
     * 调整缩放比例
     * @param {number} x
     * @param {number} y
     * @param {number} ratio
     * @return {[number, number]}
     */
    static calcPosition(x, y, ratio) {
        const force = 1 / (((x - CENTER_X) ** 2 + (y - CENTER_Y) ** 2) ** 0.520);  // 魔法参数
        const dx = ratio * force * (x - CENTER_X) + randomInt(-1, 1);
        const dy = ratio * force * (y - CENTER_Y) + randomInt(-1, 1);
        return [x - dx, y - dy];
    }

    calc(generateFrame) {
        // 圆滑的周期的缩放比例
        const ratio = 10 * curve(generateFrame / 10 * Math.PI);
        const haloRadius = Math.trunc(4 + 6 * (1 + curve(generateFrame / 10 * Math.PI)));
        const haloNumber = Math.trunc(3000 + 4000 * Math.abs(curve(generateFrame / 10 * Math.PI) ** 2));

        const allPoints = [];

        // 光环
        const heartHaloPoint = [];              // 光环的点坐标集合
        for (let i = 0; i < haloNumber; i++) {
            const t = randomUniform(0, 2 * Math.PI);       // 随机不到的地方造成爱心有缺口
            let [x, y] = heartFunc(t, 11.6);   // 魔法参数
            [x, y] = shrink(x, y, haloRadius);
            if (heartHaloPoint.find(p => p[0] === x && p[1] === y) === undefined) {
                // 处理新的点
                addPointUnique(heartHaloPoint, [x, y]);
                x += randomInt(-14, 14);
                y += randomInt(-14, 14);
                const size = randomChoice([1, 2, 2]);
                allPoints.push([x, y, size]);
            }
        }

        // 轮廓
        for (let [x, y] of this.points) {
            [x, y] = Heart.calcPosition(x, y, ratio);
            const size = randomInt(1, 3);
            allPoints.push([x, y, size]);
        }

        // 内容
        for (let [x, y] of this.edgeDiffusionPoints) {
            [x, y] = Heart.calcPosition(x, y, ratio);
            const size = randomInt(1, 2);
            allPoints.push([x, y, size]);
        }

        for (let [x, y] of this.centerDiffusionPoints) {
            [x, y] = Heart.calcPosition(x, y, ratio);
            const size = randomInt(1, 2);
            allPoints.push([x, y, size]);
        }

        this.allPoints[generateFrame] = allPoints;
    }

    /**
     * 渲染每一帧
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} renderFrame
     */
    render(ctx, renderFrame) {
        for (const [x, y, size] of this.allPoints[renderFrame % this.generateFrame]) {
            ctx.fillStyle = HEART_COLOR;
            ctx.fillRect(x, y, x + size, y + size);
        }
    }
}

/**
 *  入口函数
 */
(function main() {
    const heart = new Heart();
    console.log(heart.allPoints);
    let renderFrame = 0;
    setInterval(() => {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        heart.render(ctx, renderFrame ++);
    }, 160);
})();


