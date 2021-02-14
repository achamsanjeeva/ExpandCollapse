let bgcInput = document.getElementById("bgc");
let collapseInput =  document.getElementById("collapse");
let expandInput =  document.getElementById("expand");

chrome.storage.sync.get(["bgc","collapseColor","expandColor"], function(result){
    let _bgc = result.bgc;
    let _collapse = result.collapseColor;
    let _expand = result.expandColor;
   if(typeof _bgc === 'undefined')
        _bgc = 'lightgray';
   if(typeof _collapse === 'undefined')
       _collapse = "#f76205";
   if(typeof _expand === 'undefined')
       _expand = "green";

    bgcInput.value = _bgc;
    collapseInput.value = _collapse;
    expandInput.value = _expand;


    changeBackGroundColor();
    changeCollapseColor();
    changeExpandColor();

});



bgcInput.addEventListener("keyup",  (event) => {
    changeBackGroundColor();
});

expandInput.addEventListener("keyup",  (event) => {
    changeExpandColor();
});

collapseInput.addEventListener("keyup",  (event) => {
    changeCollapseColor();

});

document.getElementById("bgcbutton").addEventListener("click",  (event) => {
    chrome.storage.sync.set({"bgc":bgcInput.value,"collapseColor":collapseInput.value,"expandColor":expandInput.value});
    window.close();

});

document.getElementById("sourceCode").addEventListener('click',function (){
    window.open('https://github.com/achamsanjeeva/ExpandCollapse');
})

function  changeBackGroundColor(){

    let elements = document.getElementsByClassName("noMargin");
    for(let i=0;i<elements.length;i++){
        elements[i].style.background = bgcInput.value;
    }
}

function changeCollapseColor() {
    document.getElementById("collapsesvg").setAttribute("fill", document.getElementById("collapse").value);
}

function changeExpandColor(){
    document.getElementById("expandsvg").setAttribute("fill",document.getElementById("expand").value);
}
