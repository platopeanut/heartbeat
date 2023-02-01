const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// 初始化Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);



function createWireFrameBox(x, y, z) {
    const geometry = new THREE.BoxGeometry( 10, 10, 10 );
    const edges = new THREE.EdgesGeometry( geometry );
    const box = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xffffff}));
    box.position.set(x, y, z)
    return box;
}

const boxList = [];
for (let i = -5; i < 5; i++) {
    for (let j = -5; j < 5; j++) {
        const box = createWireFrameBox(i * 10, j * 10, 0);
        boxList.push(box);
        scene.add(box);
    }
}

window.onkeydown = e => {
    if (e.key === 'w') camera.position.y ++;
    else if (e.key === 's') camera.position.y --;
    else if (e.key === 'a') camera.position.x --;
    else if (e.key === 'd') camera.position.x ++;
    else if (e.key === 'q') camera.position.z ++;
    else if (e.key === 'e') camera.position.z --;
}


function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();