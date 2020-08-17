let ease = 0.3;
let video;
let poseNet;
let poses = [];

let x = 0;
let y = 0;
let a = 0;
let s = 0;

function preload()
{
}

function setup()
{
    createCanvas(640, 480);
    imageMode(CENTER);
    rectMode(CENTER);
	
    // ビデオを準備
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    // PoseNet を準備
    poseNet = ml5.poseNet(video);
    poseNet.on('pose', poseDetected);

    x = width / 2;
    y = height / 2;
}

function draw()
{
    image(video, 320, 240, width, height);
    drawFace();
}

// ポーズ検出
function poseDetected(results)
{
    poses = results;
}

// 顔を描画
function drawFace()
{
    // 検出した人数分処理する
    for (let i = 0; i < poses.length; i++)
    {
        let pose = poses[i].pose;
        if (pose.score > 0.2)
        {
            // 耳の幅を算出
            let scale = dist(pose.leftEar.x, pose.leftEar.y, pose.rightEar.x, pose.rightEar.y);
            // 左右の目の2点から角度を得る
            let angle = atan2(pose.leftEye.y - pose.rightEye.y, pose.leftEye.x - pose.rightEye.x);

            // 目と鼻の座標をもとに描画位置を決定
            // 座標のブレをおさえる
            x += (pose.nose.x - x) * ease;
            y += (pose.nose.y - y) * ease;
            a += (angle - a) * ease;
            s += (scale - s) * ease;

            // キャンバス位置と角度を変更
            push();
            translate(x, y);
            rotate(a);
            // 矩形を描画
            stroke(255, 255, 255);
            noFill();
            rect(0, 0, s, s);
            pop();
        }
    }
}