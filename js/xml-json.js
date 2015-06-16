/**
 * xml转json对象
 * @version 20150312
 */

function xmlToJsonObject(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["attributes"][attribute.nodeName] = attribute.nodeValue;
            }
            /*
            如果该节点有属性并且有文本值，如：<ArchieveItem name="fdoccode" title="编号">2014-12-4-0086</ArchieveItem>
            则值放value下 20141205
             */
            if (xml.hasChildNodes() && xml.childNodes.length == 1 && xml.firstChild.nodeType == 3) {
                obj["value"] = xml.firstChild.textContent.toString();
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);

            if (item.nodeType == 3) {
                continue;
            }

            var nodeName = item.nodeName;

            if (typeof(obj[nodeName]) == "undefined") {
            	//20150312. nodeType:1是元素，2是属性，3是文本，4是<![CDATA[文本内容]]>
                if (item.childNodes.length == 1 && (item.firstChild.nodeType == 3 || item.firstChild.nodeType == 4) && item.attributes.length == 0 && item.textContent) {
                    obj[nodeName] = item.textContent.toString();
                }else if (item.childNodes.length == 0 && item.textContent == "") {
                    obj[nodeName] = "";
                }else if (nodeName.toLowerCase().indexOf("item") == nodeName.length-4) {
                    //如果节点名称末尾包含item（如文件列表、正文附件列表、流程信息列表等），将其转为数组类型
                    obj[nodeName] = [];
                    obj[nodeName].push(arguments.callee(item));
                }else {
                    obj[nodeName] = xmlToJson(item);
                }
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));

            }
        }
    }
    return obj;
};
