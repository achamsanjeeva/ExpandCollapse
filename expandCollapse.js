function expandCollapse() {

    let dataArray;
    let _g_multilineComment = false;
    let _g_codeBlock;
    let _g_fileType;
    let _g_start_of_language_constructs = -1;
    let _g_end_of_language_constructs = -1;
    let _g_bgc,_g_collapseColor,_g_expandColor;
    let _g_expandDefinition,_g_collapseDefinition;
    let _g_elements_after_includes = [];
    let _g_include_eclipse_span;
    let _g_includes_array = [];

    function process() {

        let dataElement;
        _g_codeBlock = [];
        dataArray = [];

        removeExistingElements();
        determineFileType();
        defineExpandCollapseSVG();
        addExpandCollapseSpans();

        let elements = document.querySelectorAll('[id^="LC"]');
        elements.forEach(function (_element, index) {

            dataArray.push(
                {
                    index: parseInt(_element.id.substr(2)),
                    element: _element
                }
            );
        });

        for (let i = 0; i < dataArray.length; i++) {
            dataElement = dataArray[i];
            processLine(dataElement);
        }
        addIncludes();
    }
    function removeExistingElements(){
        document.querySelectorAll('[id^="expand_"]').forEach(function (_element){
            _element.remove();
        });
        document.querySelectorAll('[id^="collapse_"]').forEach(function (_element){
            _element.remove();
        });
        document.querySelectorAll('[id^="eclipse_"]').forEach(function (_element){
            _element.remove();
        });
        document.querySelectorAll('[id^="ellipsis_"]').forEach(function (_element){
            _element.remove();
        });

    }

    function addExpandCollapseSpans(){
        let elements = document.querySelectorAll('[id^="LC"]');
        elements.forEach(function (_element) {
            let lineNo = parseInt(_element.id.substr(2));
            let expandSpan = document.createElement("span");
            expandSpan.setAttribute("id", "expand_" + lineNo);
            expandSpan.setAttribute("style", "margin-right: 8px;");
            let element = document.getElementById("LC" + lineNo);


            element.insertBefore(expandSpan, element.childNodes[0]);

            let collapseSpan = document.createElement("span");
            collapseSpan.setAttribute("id", "collapse_" + lineNo);
            collapseSpan.setAttribute("style", "margin-right: 8px;");
            element = document.getElementById("LC" + lineNo);
            element.insertBefore(collapseSpan, element.childNodes[0]);


        });
    }
    function defineExpandCollapseSVG(){

         _g_expandDefinition= '<svg version="1.1" width="21px"  xmlns="http://www.w3.org/2000/svg"  xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 -150 900 650" enable-background="new 0 0 800 500" xml:space="preserve" '+
                                        ' fill="'+_g_expandColor+'" >'+
                                        '<metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>' +
                                        '<g><path d="M441.5 39.8C432.9 25.1 417.1 16 400 16H176c-17.1 0-32.9 9.1-41.5 23.8l-112 192c-8.7 14.9-8.7 33.4 0 48.4l112 192c8.6 14.7 24.4 23.8 41.5 23.8h224c17.1 0 32.9-9.1 41.5-23.8l112-192c8.7-14.9 8.7-33.4 0-48.4l-112-192zM400 448H176L64 256 176 64h224l112 192-112 192zm16-208v32c0 6.6-5.4 12-12 12h-88v88c0 6.6-5.4 12-12 12h-32c-6.6 0-12-5.4-12-12v-88h-88c-6.6 0-12-5.4-12-12v-32c0-6.6 5.4-12 12-12h88v-88c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v88h88c6.6 0 12 5.4 12 12z"></path></g>'+

                                '</svg>';
         _g_collapseDefinition= '<svg version="1.1" width="21px"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 -150 900 650" enable-background="new 0 0 800 500" xml:space="preserve" '+
                                        ' fill="'+_g_collapseColor+'" >'+
                                        '<metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>' +
                                        '<g><path d="M441.5 39.8C432.9 25.1 417.1 16 400 16H176c-17.1 0-32.9 9.1-41.5 23.8l-112 192c-8.7 14.9-8.7 33.4 0 48.4l112 192c8.6 14.7 24.4 23.8 41.5 23.8h224c17.1 0 32.9-9.1 41.5-23.8l112-192c8.7-14.9 8.7-33.4 0-48.4l-112-192zM400 448H176L64 256 176 64h224l112 192-112 192zM172 284c-6.6 0-12-5.4-12-12v-32c0-6.6 5.4-12 12-12h232c6.6 0 12 5.4 12 12v32c0 6.6-5.4 12-12 12H172z"></path></g>'+
                                    '</svg>';

    }
    function determineFileType(){
        let extension = "";
        if(document.getElementsByClassName("final-path") &&  document.getElementsByClassName("final-path")[0]){
            extension = document.getElementsByClassName("final-path")[0].textContent.toLocaleLowerCase();
        }
        if(extension.endsWith(".c")){
            _g_fileType = "C";
        }
        else if(extension.endsWith(".cc") || extension.endsWith(".cpp")){
            _g_fileType = "C++";
        }
        else if(extension.endsWith(".java")){
            _g_fileType = "JAVA";
        }
        else if(extension.endsWith(".cs")){
            _g_fileType = "C#";
        }
        else if(extension.endsWith(".swift")){
            _g_fileType = "SWIFT";
        }
        else if(extension.endsWith(".php")){
            _g_fileType = "PHP";
        }

    }

    function processLine(dataElement) {

        let currentChar = "", previousChar = "", nextChar = "";

        let data = "", elementData;
        let element = dataElement.element;
        let childNodes = element.childNodes;
        let codeStart, codeEnd, start, end;
        let characterNodeIndex = [];
        let dataLength = 0;

        for (let outerIndex = 0; outerIndex < childNodes.length; outerIndex++) {
            if (childNodes[outerIndex].nodeType === 1 && childNodes[outerIndex].childElementCount > 0) {
                // node has child elements so skip the processing of the node.
                continue;
            }
            if (childNodes[outerIndex].nodeType === 1) {
                //for rest of the nodes
                elementData = childNodes[outerIndex].innerText;
            } else {
                // for text nodes
                elementData = childNodes[outerIndex].data;
            }
            for (let innerIndex = 0; innerIndex < elementData.length; innerIndex++) {
                characterNodeIndex.push(outerIndex);
            }
            data = data + elementData;
        }
        dataElement.data = data;

        for (let index = 0; index < data.length; index++) {
            previousChar = currentChar;
            currentChar = data.charAt(index);
            nextChar = index < data.length ? data.charAt(index + 1) : "";
            if (!_g_multilineComment) {
                if ((currentChar === '"' || currentChar === "'") && previousChar !== '\\') {
                    index = findEndOfString(data, currentChar, index + 1);
                    continue;
                }
                if (currentChar === '/' && nextChar === '/') {
                    // single line comment
                    index = data.length;

                }
                if (currentChar === '/' && nextChar === '*') {
                    // multi line comment
                    index = endOfMultilineComment(data, index + 2);
                    if (index === data.length) {
                        _g_multilineComment = true;
                    }
                }
                if (currentChar === '{') {
                    _g_codeBlock.push({
                        curlyBracePosition: index,
                        dataElement: dataElement,
                        characterNodeIndex: characterNodeIndex
                    });

                }
                if (currentChar === '}') {
                    start = _g_codeBlock.pop();

                    codeStart = start.dataElement.index;
                    codeEnd = dataElement.index;

                    end = {curlyBracePosition: index, dataElement: dataElement, characterNodeIndex: characterNodeIndex}
                    if (codeStart !== codeEnd) {
                        addColorChangeEventToBlock(start, end);
                        addExpandCollapse(codeStart, codeEnd);
                    }
                }
            } else {
                index = endOfMultilineComment(data, index);
                if (index < data.length) {
                    _g_multilineComment = true;
                }
            }
        }
        let content = data.trimLeft();
        if(_g_fileType === 'JAVA'){
            processIncludes(content,"import ",dataElement);
        }
        else if(_g_fileType === 'C' || _g_fileType === 'C++'){
            processIncludes(content,"#include ",dataElement);
        }
        else if(_g_fileType === 'C#' ){
            processIncludes(content,"using ",dataElement);
        }
        else if(_g_fileType === 'SWIFT' ){
            processIncludes(content,"import ",dataElement);
        }
        else if(_g_fileType === 'PHP' ){
            processIncludes(content,"use ",dataElement);
        }
    }
    function processIncludes(content,searchString,dataElement){
        if(content.startsWith(searchString)){
            if(_g_start_of_language_constructs === -1){
                _g_start_of_language_constructs = dataElement.index;
            }
            _g_end_of_language_constructs = dataElement.index;
        }
        if(_g_start_of_language_constructs !== -1){
            if(content.trim().length !== 0  && !content.startsWith(searchString) ){
                if(_g_start_of_language_constructs !== _g_end_of_language_constructs) {
                    _g_includes_array.push({
                        start: _g_start_of_language_constructs,
                        end: _g_end_of_language_constructs
                    });
                }
                _g_start_of_language_constructs = -1;
                _g_end_of_language_constructs = -1;
            }
        }
    }

    function endOfMultilineComment(data, index) {
        let currentChar, nextChar, i;
        for (i = index; i < index.length; i++) {
            currentChar = data.charAt(index);
            nextChar = index < data.length ? data.indexOf(index + 1) : "";
            if (currentChar === '*' && nextChar === '/') {
                break;
            }
        }
        return i;

    }

    function findEndOfString(data, delimiter, index) {
        let previousChar, char;
        let i;
        for ( i = index; i < data.length; i++) {
            previousChar = i > 0 ? data.indexOf(i - 1) : "";
            char = data.charAt(i);
            if (char === delimiter && previousChar !== '\\') {
                break;
            }
        }
        return i;
    }

    function addExpandCollapse(start, end) {
        let expandSpan = document.getElementById("expand_"+start);
        expandSpan.innerHTML = _g_expandDefinition;
        expandSpan.addEventListener("click", showCode(start, end));
        expandSpan.setAttribute("style", "display: none;");



        let collapseSpan = document.getElementById("collapse_"+start);
        collapseSpan.innerHTML = _g_collapseDefinition;
        collapseSpan.addEventListener("click", hideCode(start, end));
        collapseSpan.setAttribute("style", "margin-right: 16px;");

    }

    function hideCode(start, end) {
        return function () {
            for (let index = start + 1; index < end; index++) {
                document.getElementById("LC" + index).parentElement.style.display = 'none';
            }
            document.getElementById("eclipse_"+ (start) ).innerHTML= '...';

            document.getElementById("expand_" + start).setAttribute("style", "margin-right: 16px;");
            document.getElementById("collapse_" + start).setAttribute("style","display : none");
        }
    }

    function showCode(start, end) {
        return function () {
            for (let index = start + 1; index < end; index++) {
                document.getElementById("LC" + index).parentElement.style.display = '';
            }
            document.getElementById("eclipse_"+(start) ).innerHTML= '';

            document.getElementById("expand_" + start).setAttribute("style","display : none");
            document.getElementById("collapse_" + start).setAttribute("style", "margin-right: 16px;");
        }
    }

    function addColorChangeEventToBlock(start, end) {
        // processing
        let startCurlyNodeIndex = addColorChangeEvent(start, start.dataElement.index + 1, end.dataElement.index - 1,true);
        let endCurlyNodeIndex = addColorChangeEvent(end, start.dataElement.index + 1, end.dataElement.index - 1,false);
        addCodeDemarcation(start.dataElement.index, startCurlyNodeIndex, end.dataElement.index, endCurlyNodeIndex);

        function addCodeDemarcation(startLineIndex, startCurlyNodeIndex, endLineIndex, endCurlyNodeIndex) {
            document.getElementById("LC" + startLineIndex)
                .childNodes[startCurlyNodeIndex].setAttribute('data-corresponding-node-index', endCurlyNodeIndex);
            document.getElementById("LC" + startLineIndex)
                .childNodes[startCurlyNodeIndex].setAttribute('data-corresponding-line-index', end.dataElement.index);

            document.getElementById("LC" + endLineIndex)
                .childNodes[endCurlyNodeIndex].setAttribute('data-corresponding-node-index', startCurlyNodeIndex);
            document.getElementById("LC" + endLineIndex)
                .childNodes[endCurlyNodeIndex].setAttribute('data-corresponding-line-index', start.dataElement.index);

        }

        function addColorChangeEvent(obj, startLineNo, endLineNo,addEclipse) {
            let index;
            let blockElement = obj.dataElement.element;
            let curlyBracePosition = obj.curlyBracePosition;
            let characterNodeIndex = obj.characterNodeIndex;
            let data = obj.dataElement.data;

            let nodeIndex = characterNodeIndex[curlyBracePosition];
            for (index = curlyBracePosition - 1; index >= 0; index--) {
                if (characterNodeIndex[index] !== nodeIndex) {
                    break;
                }
            }
            let _begin = index + 1;
            blockElement.childNodes[nodeIndex].textContent = data.substring(_begin, curlyBracePosition);
            for (index = curlyBracePosition + 1; index < characterNodeIndex.length; index++) {
                if (characterNodeIndex[index] !== nodeIndex) {
                    break;
                }
            }

            let _end = index;

            let startSpan = document.createElement('span');
            startSpan.textContent = data.substring(curlyBracePosition, curlyBracePosition + 1);
            blockElement.insertBefore(startSpan, blockElement.childNodes[nodeIndex].nextSibling);
            let braceNodeIndex = nodeIndex + 1


            for (index = curlyBracePosition; index < characterNodeIndex.length; index++) {
                // increase node index after adding child
                characterNodeIndex[index] += 1;
            }

            startSpan.addEventListener("dblclick", toggleBackGroundColor(startSpan, startLineNo, endLineNo))
            nodeIndex++;

            if(addEclipse) {
                let eclipseSpan = document.createElement('span');
                eclipseSpan.setAttribute("id", "eclipse_" + (startLineNo - 1));
                eclipseSpan.setAttribute("style", "cursor:pointer;background:yellow");

                eclipseSpan.addEventListener("click", showCode(startLineNo - 1, endLineNo+1));
                blockElement.insertBefore(eclipseSpan, blockElement.childNodes[nodeIndex].nextSibling);
                for (index = curlyBracePosition + 1; index < characterNodeIndex.length; index++) {
                    // increase node index after adding child
                    characterNodeIndex[index] += 1;
                }
                nodeIndex++;
            }

            let startText = document.createElement('text');
            startText.textContent = data.substring(curlyBracePosition + 1, _end);
            blockElement.insertBefore(startText, blockElement.childNodes[nodeIndex].nextSibling);

            for (index = curlyBracePosition + 1; index < characterNodeIndex.length; index++) {
                // increase node index after adding child
                characterNodeIndex[index] += 1;
            }
            obj.characterNodeIndex = characterNodeIndex;
            return braceNodeIndex;
        }

    }


    function toggleBackGroundColor(span, startLineNo, endLineNo) {

        return function () {

            chrome.storage.sync.get("bgc", ({bgc}) => {

                if (typeof bgc === 'undefined')
                    bgc = 'lightgray';

                changeBGCColor(span,startLineNo,endLineNo,bgc);
            });

            function changeBGCColor(span,startLineNo,endLineNo,bgc) {

                let appliedColor = span.getAttribute("data-applied-color");
                if (appliedColor === null || appliedColor === "false") {
                    appliedColor = "true"

                    for (let index = startLineNo; index <= endLineNo; index++) {
                        document.getElementById("LC" + index).parentElement.style.background = bgc;
                    }
                } else {
                    appliedColor = "false"
                    for (let index = startLineNo; index <= endLineNo; index++) {
                        document.getElementById("LC" + index).parentElement.style.background = 'white';
                    }

                }
                let correspondingLineIndex = span.getAttribute("data-corresponding-line-index");
                let correspondingNodeIndex = parseInt(span.getAttribute("data-corresponding-node-index"));

                span.setAttribute("data-applied-color", appliedColor);
                document.getElementById("LC" + correspondingLineIndex)
                    .childNodes[correspondingNodeIndex].setAttribute("data-applied-color", appliedColor);


            }
        }
    }
    function addIncludes(){
        _g_includes_array.forEach(function (_include,index){

            let expandSpan = document.getElementById("expand_"+_include.start);
            expandSpan.innerHTML = _g_expandDefinition;
            expandSpan.addEventListener("click", showIncludes(_include.start, _include.end+1,index));
            expandSpan.setAttribute("style", "display: none;");



            let collapseSpan = document.getElementById("collapse_"+_include.start);
            collapseSpan.innerHTML = _g_collapseDefinition;
            collapseSpan.addEventListener("click", hideIncludes(_include.start, _include.end+1,index));



            let includeEllipsisSpan = document.createElement("span");
            includeEllipsisSpan.innerHTML = "...";
            includeEllipsisSpan.setAttribute("id", "ellipsis_"+_include.start);
            includeEllipsisSpan.setAttribute("style", "cursor:pointer;background:yellow");


            document.getElementById("LC"+_include.start).insertBefore(includeEllipsisSpan,
                document.getElementById("LC"+_include.start).childNodes[4]);

            includeEllipsisSpan.addEventListener('click',showIncludes(_include.start, _include.end+1,index))


            _g_includes_array[index].elementsAfterInclude =  extractElementsAfterIncludes(_include.start);
            hideIncludes(_include.start, _include.end+1,index)();

        });



        function extractElementsAfterIncludes(startOfInclude){

            let _childNodes =document.getElementById("LC"+startOfInclude).childNodes;
            let _elementsAfterInclude = [];
            for(let index = _childNodes.length -1 ;index >= 5 ;index--){
                _elementsAfterInclude.push(_childNodes[index]);
            }
            return _elementsAfterInclude;
        }

    }

    function hideIncludes(start, end,includesIndex) {
        return function () {
            for (let index = start + 1; index < end; index++) {
                document.getElementById("LC" + index).parentElement.style.display = 'none';
            }
            document.getElementById("ellipsis_"+start).style.display = '';
            let _elementsAfterInclude = _g_includes_array[includesIndex].elementsAfterInclude;
            for(let index=0;index<_elementsAfterInclude.length;index++){
                if(_elementsAfterInclude[index].style){
                    _elementsAfterInclude[index].style.display='none';
                }
            }
            document.getElementById("expand_" + start).setAttribute("style", "display: box");
            document.getElementById("collapse_" + start).setAttribute("style","display : none");
        }
    }

    function showIncludes(start, end,includesIndex) {
        return function () {
            for (let index = start + 1; index < end; index++) {
                document.getElementById("LC" + index).parentElement.style.display = '';
            }
            document.getElementById("ellipsis_"+start).style.display = 'none';
            let _elementsAfterInclude = _g_includes_array[includesIndex].elementsAfterInclude;
            for(let index=0;index<_elementsAfterInclude.length;index++){
                if(_elementsAfterInclude[index].style){
                    _elementsAfterInclude[index].style.display='';
                }
            }
            document.getElementById("expand_" + start).setAttribute("style","display : none");
            document.getElementById("collapse_" + start).setAttribute("style", "display: box");
        }
    }

    chrome.storage.sync.get(["bgc","collapseColor","expandColor"], function(result) {
        _g_bgc = result.bgc;
        _g_collapseColor = result.collapseColor;
        _g_expandColor = result.expandColor;
        if (typeof _g_bgc === 'undefined')
            _g_bgc = 'lightgray';
        if (typeof _g_collapseColor === 'undefined')
            _g_collapseColor = "#f76205";
        if (typeof _g_expandColor === 'undefined')
            _g_expandColor = "green";
        process();
    });
}
expandCollapse();


