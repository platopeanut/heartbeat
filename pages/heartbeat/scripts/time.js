const time_display = document.getElementById("time_display");

function formatDate(date) {
    const year = date.getFullYear();                                //获取当前年份   
    const month = (date.getMonth() + 1 + '').padStart(2, '0');      //获取当前月份   
    const day = (date.getDate() + '').padStart(2, '0');             //获取当前日   
    const hour = (date.getHours() + '').padStart(2, '0');           //获取小时   
    const minute = (date.getMinutes() + '').padStart(2, '0');       //获取分钟   
    const second = (date.getSeconds() + '').padStart(2, '0');       //获取秒  
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function displayDate() {
    const startDate = new Date("2023-01-01 15:00:00");
    const currentDate = new Date();
    time_display.innerText = `${formatDate(startDate)}
                            ${formatDate(currentDate)}
                            ${betweenSecond(startDate, currentDate)} Second
                            ${betweenDay(startDate, currentDate)} Day`;
}

function betweenSecond(date1, date2) {
    return Math.ceil((date2.getTime() - date1.getTime()) / 1000);
}

function betweenDay(date1, date2) {
    return Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

displayDate();
setInterval(() => {
    displayDate();
}, 500);