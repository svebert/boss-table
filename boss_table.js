function getNumberOfColumns(column_array){
 var idx_min=10000;
 var idx_max=0;
 var idx;
 for(idx = 0; idx < column_array.length; idx++)
 {
    var nDisp;
    if( !("display_column" in tableDescr.columns[idx])){
        nDisp = idx;
    }
    else{
        nDisp = tableDescr.columns[idx]["display_column"];
    }
    if(nDisp< idx_min){
        idx_min = nDisp;
    }
    if(nDisp > idx_max){
        idx_max = nDisp;
    }
 }
 nCols = idx_max -idx_min+1;
 return nCols;
}
function addTable(tableDescr)
{
  var table = document.getElementById(tableDescr.name);
  table.innerHTML = "";
  var tableHead = document.createElement('THEAD');
   tableHead.setAttribute("class", "boss-table");
  var col;
  var trhead = document.createElement('TR');
  trhead.setAttribute("class", "boss-table");
  var nCols = getNumberOfColumns(tableDescr.columns);
  var th_array = new Array(nCols);
  var idx;
  for(idx=0; idx < nCols; idx++)
  {
    th_array[idx] = document.createElement('TH');
    th_array[idx].setAttribute("class", "boss-table");
  }

  for(idx in tableDescr.columns)
  {
    if("visible" in tableDescr.columns[idx] && tableDescr.columns[idx].visible == 0) {
        continue;
    }
    var idx_node = idx;
    if("display_column" in tableDescr.columns[idx]){
        idx_node=tableDescr.columns[idx].display_column;
    }
    if(th_array[idx_node].hasChildNodes()){
        th_array[idx_node].appendChild(document.createElement("br"));
    }
    var icon_node = document.createElement('a');
    icon_node.setAttribute("href","#");
    icon_node.setAttribute("class","boss-table bsst-btn-sort");

    var sorted = 0;
    if(!("sorted" in tableDescr.columns[idx])){
        tableDescr.columns[idx]["sorted"] = sorted;
    }
    else{
        sorted = tableDescr.columns[idx].sorted;
    }
    var elem_sort_asc = document.createElement('i');
    elem_sort_asc.setAttribute("class","fas fa-angle-down");
    var elem_sort_desc = document.createElement('i');
    elem_sort_desc.setAttribute("class","fas fa-angle-up");
    if("icons" in tableDescr){
        if("sort_asc" in tableDescr.icons){
            elem_sort_asc = tableDescr.icons.sort_asc.cloneNode(true);
        }
        if("sort_desc" in tableDescr.icons){
            elem_sort_desc = tableDescr.icons.sort_desc.cloneNode(true);
        }
    }
    var elem_sort;
    if(sorted==0){
        icon_node.onclick = OnClickSortASC;
        elem_sort = elem_sort_asc;
    }
    else{
        icon_node.onclick = OnClickSortDESC;
        elem_sort = elem_sort_desc
    }
    elem_sort.setAttribute("id","bsst-btn-sort-"+tableDescr.name + "-" + idx.toString());
    icon_node.appendChild(elem_sort);
    th_array[idx_node].appendChild(document.createTextNode(tableDescr.columns[idx].title));
    th_array[idx_node].appendChild(icon_node);
  }

  for(idx=0; idx < th_array.length; idx++){
    if(th_array[idx].childNodes.length > 0){
        trhead.appendChild(th_array[idx]);
    }
  }

  tableHead.appendChild(trhead);
  table.appendChild(tableHead);

  var tableBody = document.createElement('TBODY');
  tableBody.setAttribute("class", "boss-table");
  var idx_start = tableDescr.page_length*tableDescr.state.current_page;
  var idx_max = tableDescr.data.length;
  var idx_end = idx_max;
  if(idx_end > idx_start + tableDescr.page_length){
    idx_end = idx_start + tableDescr.page_length;
  }
  var y;
  for (y=idx_start; y < idx_end; y++)
  {
    var tr = document.createElement('TR');
    tr.setAttribute("class", "boss-table");
    tableBody.appendChild(tr);
    var x;
    var td_array = new Array(nCols);
    for (x=0;x<nCols; x++)
    {
      td_array[x] = document.createElement('TD');
      td_array[x].setAttribute("class", "boss-table");
    }
    var idx=0;
    for(idx=0; idx < tableDescr.columns.length; idx++){
       if("visible" in tableDescr.columns[idx] && tableDescr.columns[idx].visible == 0) {
           continue;
       }
       var nDispCol = idx;
       if("display_column" in tableDescr.columns[idx]){
         nDispCol=tableDescr.columns[idx].display_column;
       }
       key = tableDescr.columns[idx].data
       data_obj = tableDescr.data[y][key];
       var data_disp = data_obj;
       var data_node;
       if(typeof data_obj == "object"){
            if("display" in data_obj){
                data_disp = data_obj.display;
            }
            else{
            if(!(data_obj instanceof Date)) {
               console.log("Unexpected structure of data object. Expect keys 'data' and 'display'");}
            }
        }
        if(typeof data_disp == "number" || typeof data_disp == "string" || data_disp instanceof Date)
        {
            if("format_options" in tableDescr.columns[idx]){
               data_disp = data_disp.toLocaleString(undefined, tableDescr.columns[idx].format_options);
            }
            else{
                data_disp = data_disp.toLocaleString();
            }
            data_node = document.createTextNode(data_disp);
        }
        else{
            data_node=data_disp;
        }
       if(td_array[nDispCol].hasChildNodes()){
        td_array[nDispCol].appendChild(document.createElement("br"));
       }
       td_array[nDispCol].appendChild(data_node);
    }
    for (x=0;x<nCols; x++)
    {
        if(td_array[x].childNodes.length > 0){
            tr.appendChild(td_array[x]);
        }
    }
  }
  table.appendChild(tableBody);
}

function addPagination(tableDescr) {
 if("pagination" in tableDescr && tableDescr.pagination <= 0){
    return;
 }
 var page_max = tableDescr.data.length/tableDescr.page_length;
 if(page_max == 0) { return;}
 elm_pagination = document.getElementById(tableDescr.name + "_pagination");
 if(elm_pagination==null){
    console.log("no div element with id="+tableDescr.name + "_pagination" + " , but pagination not disabled");
    return;
 }
 elm_pagination.innerHTML = "";

 var elm_table = document.createElement('table');
 elm_table.setAttribute("class","boss-table bsst-pagination");
 var elm_table_tr = document.createElement('tr');
 elm_table_tr.setAttribute("class", "bsst-pagination")
 var elm_table_td_text = document.createElement('td');
 elm_table_td_text.setAttribute("class", "bsst-pagination bsst-pagination-text")
 elm_table_tr.appendChild(elm_table_td_text);
 elm_table.appendChild(elm_table_tr);
 var idx_start = tableDescr.page_length*tableDescr.state.current_page;
 var idx_max = tableDescr.data.length;
 var idx_end = Math.min(idx_max, idx_start + tableDescr.page_length);
 var text = document.createTextNode("Showing " + idx_start.toString() +  " to " + idx_end.toString() + " of " + idx_max.toString() + " entries");
 elm_table_td_text.appendChild(text);
 elm_pagination.appendChild(elm_table)

 var elm_table_td_first = document.createElement('td');
 elm_table_td_first.setAttribute("class", "bsst-pagination bsst-pagination-first");
 var textFirst = document.createTextNode("First");
 var elm_table_td_backward = document.createElement('td');
 elm_table_td_backward.setAttribute("class", "bsst-pagination bsst-pagination-previous");
 var textPrevious = document.createTextNode("Previous");
 var elm_table_td_forward = document.createElement('td');
 elm_table_td_forward.setAttribute("class", "bsst-pagination bsst-pagination-next");
 var textNext = document.createTextNode("Next");
 var elm_table_td_last = document.createElement('td');
 elm_table_td_last.setAttribute("class", "bsst-pagination bsst-pagination-last");
 var textLast = document.createTextNode("Last");
 elm_table_tr.appendChild(elm_table_td_first);
 elm_table_tr.appendChild(elm_table_td_backward);
 elm_table_tr.appendChild(elm_table_td_forward);
 elm_table_tr.appendChild(elm_table_td_last);
 if(tableDescr.state.current_page > 0){
    var hrefFirst = document.createElement('a');
    hrefFirst.setAttribute("id","bsst-btn-pagination-first-" + +tableDescr.name);
    hrefFirst.setAttribute("href","#");
    hrefFirst.onclick = OnClickFirst;
    hrefFirst.appendChild(textFirst);
    elm_table_td_first.appendChild(hrefFirst)

    var href = document.createElement('a');
    href.setAttribute("id","bsst-btn-pagination-previous-"+tableDescr.name);
    href.setAttribute("href","#");
    href.onclick = OnClickBackward;
    href.appendChild(textPrevious);
    elm_table_td_backward.appendChild(href)
 }
 else
 {
   elm_table_td_first.appendChild(textFirst);
   elm_table_td_backward.appendChild(textPrevious);
 }
 if(tableDescr.state.current_page < page_max -1) {
    var href = document.createElement('a');
    href.appendChild(textNext);
    href.setAttribute("id","bsst-btn-pagination-next-"+tableDescr.name);
    href.setAttribute("href","#");
    href.onclick = OnClickForward;
    elm_table_td_forward.appendChild(href)

    var hrefLast = document.createElement('a');
    hrefLast.appendChild(textLast);
    hrefLast.setAttribute("id","bsst-btn-pagination-last-"+tableDescr.name);
    hrefLast.setAttribute("href","#");
    hrefLast.onclick = OnClickLast;
    elm_table_td_last.appendChild(hrefLast)
 }
 else
 {
   elm_table_td_forward.appendChild(textNext);
   elm_table_td_last.appendChild(textLast);
 }
}

function addOptionBox(tableDescr) {
    if(tableDescr.state.selectionBox > 0){
        return;
    }
    elem_overlay_options = document.createElement("div");
    elem_overlay_options.setAttribute("class", "boss-table bsst-options-overlay");
    elem_overlay_options.setAttribute("id", "bsst-options-overlay-"+tableDescr.name);
    elem_checkbox_list = document.createElement("ul");
    elem_checkbox_list.setAttribute("class", "boss-table bsst-check-bundle");
    elem_checkbox_list.setAttribute("id", "bsst-check-bundle-"+tableDescr.name);
    var idx;

    for(idx = 0; idx < tableDescr.columns.length; idx++){
        column_name = tableDescr.columns[idx].title;
        is_visible = 1;
        if("visible" in tableDescr.columns[idx]){is_visible=tableDescr.columns[idx].visible;}
        elem_li = document.createElement("li");
        elem_li.setAttribute("class", "boss-table");
        elem_label = document.createElement("label");
        elem_label.setAttribute("class", "boss-table");
        elem_input = document.createElement("input");
        elem_input.setAttribute("class", "boss-table");
        elem_input.setAttribute("type","checkbox");
        elem_input.checked=is_visible;
        elem_input.onchange=OnCheckboxChange;
        elem_input.id = "bsst-check-" + tableDescr.name + "-" +idx.toString();
        elem_label.appendChild(elem_input);
        elem_label.appendChild(document.createTextNode(column_name));
        elem_li.appendChild(elem_label);
        elem_checkbox_list.appendChild(elem_li);
    }
    elem_overlay_options.appendChild(elem_checkbox_list);

    elem_div_opts = document.createElement("div");
    elem_div_opts.setAttribute("class","boss-table bsst-options");

    var icon_node = document.createElement('a');
    icon_node.setAttribute("href","#");
    icon_node.setAttribute("class","boss-table bsst-btn-vdots");
    var elem_dots = document.createElement('i');
    elem_dots.setAttribute("class","fas fa-ellipsis-v");
    if("icons" in tableDescr){
    if("settings" in tableDescr.icons){
            elem_dots = tableDescr.icons.settings;
        }
    }
    icon_node.onclick = OnClickVDots;
    elem_dots.setAttribute("id","bsst-btn-vdots-"+tableDescr.name);
    icon_node.appendChild(elem_dots);
    elem_div_opts.appendChild(icon_node);

    elem_div_opts.appendChild(elem_overlay_options);
    if(!("pagination" in tableDescr) || tableDescr.pagination >0){
        elem_div = document.createElement("span");
        elem_div.setAttribute("class","boss-table bsst-select-span");
        elem_select = document.createElement("select");
        elem_select.setAttribute("class","boss-table bsst-select");
        elem_div.append(document.createTextNode("Show "));
        elem_div.appendChild(elem_select);
        elem_div.append(document.createTextNode(" entries"));
        elem_select.onchange = OnSelectionChange;
        val_array = [10, 25, 50, 100];
        var idx;
        for(idx=0; idx < val_array.length; idx++){
            elem_opt = document.createElement("option");
            elem_opt.setAttribute("value", val_array[idx]);
            elem_opt.appendChild(document.createTextNode(val_array[idx].toString()));
            elem_select.appendChild(elem_opt);
        }
        elem_div_opts.appendChild(elem_div);
    }
    const target = document.querySelector("#"+tableDescr.name);
    target.parentNode.insertBefore(elem_div_opts, target);
    tableDescr.state.selectionBox = 1;
}

function fixTableDescr(tableDescr) {
    if(!("state" in tableDescr)){
        tableDescr["state"] = {"selectionBox": 0, "current_page": 0};
    }
    if(!("pagination" in tableDescr) || tableDescr.pagination > 0){
        idx_start = tableDescr.state.current_page*tableDescr.page_length;
        if(idx_start >tableDescr.data.length -1){
            tableDescr.state.current_page = 0;
        }
    }
    else{
        tableDescr.state.current_page = 0;
        tableDescr.page_length=tableDescr.data.length;
    }
    return tableDescr;
}

function CreateBossTable(tableDescr) {
    ChangePage(tableDescr);
}

function ChangePage(tableDescr) {
    tableDescr = fixTableDescr(tableDescr);
    addOptionBox(tableDescr);
    addTable(tableDescr);
    addPagination(tableDescr);
}

function OnClickForward(){
  window.tableDescr.state.current_page++;
  ChangePage(window.tableDescr);
}

function OnClickBackward() {
  window.tableDescr.state.current_page--;
  ChangePage(window.tableDescr);
}

function OnClickLast() {
  window.tableDescr.state.current_page = Math.max(0, Math.floor(window.tableDescr.data.length/window.tableDescr.page_length));
  ChangePage(window.tableDescr);
}

function OnClickFirst() {
  window.tableDescr.state.current_page = 0;
  ChangePage(window.tableDescr);
}

function OnSelectionChange(){
   window.tableDescr["page_length"] = parseInt(this.value);
   ChangePage(window.tableDescr);
}

function OnClickSortASC(event){
var str_id = event.target.id;
var id = parseInt(str_id.substr(("bsst-btn-sort-"+tableDescr.name+"-").length));
window.tableDescr.columns[id].sorted = 1;
if(window.tableDescr.data.length > 0){
    var key;
    var idx=0;
    var idx_col=0;
    for(idx_col=0; idx_col<window.tableDescr.columns.length; idx_col++){
        if(id == idx_col){
            key = window.tableDescr.columns[idx_col].data
            break;
        }
    }
    window.tableDescr.data = window.tableDescr.data.sort(sortComperatorASC(key));
}
ChangePage(window.tableDescr);
}

function OnClickSortDESC(event){
var str_id = event.target.id;
var id = parseInt(str_id.substr(("bsst-btn-sort-"+tableDescr.name+"-").length));
window.tableDescr.columns[id].sorted = 0;
if(window.tableDescr.data.length > 0){
    var key;
    var idx=0;
    var idx_col=0;
    for(idx_col=0; idx_col<window.tableDescr.columns.length; idx_col++){
        if(id == idx_col){
            key = window.tableDescr.columns[idx_col].data
            break;
        }
    }
    window.tableDescr.data = window.tableDescr.data.sort(sortComperatorDESC(key));
}
ChangePage(window.tableDescr);
}

function OnClickVDots(event){
    id_split_arr = event.target.id.split("-")
    target = document.querySelector("#bsst-options-overlay-"+id_split_arr[id_split_arr.length -1]);
    if(target.style.display == "block"){
        target.style.display = "none";
    }
    else{
        target.style.display = "block";
    }
}

function OnCheckboxChange(event) {
    var str_id = event.target.id;
    var id = parseInt(str_id.substr(("bsst-check-"+tableDescr.name+"-").length));
    var is_visible = event.target.checked;
    if(window.tableDescr.columns.length > id){
        window.tableDescr.columns[id]["visible"] = is_visible;
    }
    ChangePage(window.tableDescr);
}

function getValueFromComplexObject(a, key){
    if(typeof a[key] == "object"){
        if("data" in a[key]){
            return a[key].data
        }
    }
    return a[key]
}

function sortComperatorASC(key){
    return function(a,b){
        a_val = getValueFromComplexObject(a, key);
        b_val = getValueFromComplexObject(b, key);
        if (typeof a_val == 'string'){
            if(a_val.toLowerCase() < b_val.toLowerCase()){return -1;}
            if(a_val.toLowerCase() > b_val.toLowerCase()){return 1;}
            return 0;
        }
        else{
        return a_val - b_val;}
    }
}
function sortComperatorDESC(key){
    return function(a,b){
        a_val = getValueFromComplexObject(a, key);
        b_val = getValueFromComplexObject(b, key);
        if (typeof a_val == 'string'){
            if(a_val.toLowerCase() > b_val.toLowerCase()){return -1;}
            if(a_val.toLowerCase() < b_val.toLowerCase()){return 1;}
            return 0;
        }
        return b_val - a_val;
    }
}
