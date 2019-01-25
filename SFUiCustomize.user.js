// ==UserScript==
// @name         SFUiCustomize
// @namespace    https://github.com/rauchi07
// @description  SalesForceClassicのUIカスタマイズ
// @include https://*.salesforce.com/*
// @include https://*.force.com/*
// ==/UserScript==
var thisPageUrl    = location.href;

//本スクリプトのエラーで元のページの処理をとめないようにする
try{
    // 実行
    setTimeout(proc,0);

}catch(exception){
    console.log('ScriptAutoRunner-error');
}

/**
 * 処理本体
 * @return {[type]} [description]
 */
function proc(){
    // ライブラリのロード
    loadLiblary()

    // ↑ロード完了後のメイン処理
    .then(function(res1,res2,res3){
        jQuery.noConflict();
        mainScript();
    //　エラー発生時
    }).catch(function(err){
        console.log(err);
    });

}

/**
 * Salesforceサイトに対するカスタマイズ処理
 * @return {[type]} [description]
 */
function mainScript(){
    //Salesforceサイトで実行する処理
    console.log('Tampermonkey:SFUiCustomize',thisPageUrl);

    // formの1番最初の入力項目にfocusをセット
    setFocusToFirstFormInput();

    // imageなどのtabindexを-1にする
    applyTabindexCustom();

    //レポート用cssカスタマイズ
    addCssRules();

    // ショートカットキー割付
    applyShortcutKeys();

    // select2適用処理
    applySelect2();

    // aaa
    profileFormCopyButtonAdd();

    // jquery quick search適用処理
    applyJqueryQuickSearch();

    // 詳細ページ、編集ページに設定画面へのリンク追加
    setSettingPageLink();

    // 変更セットページのカスタマイズ
    applyHenkoSetPageCustom();

    // 全選択チェックボックス処理上書き
    overwriteAllSelectCheckBox();

}


/**
 * 各種ライブラリ読み込み
 * @return {[type]} [description]
 */
function loadLiblary(){
    const JQUERY_JS    = createSrc('js',"//code.jquery.com/jquery-2.2.4.min.js");
    const SELECT2_CSS  = createSrc('css',"//cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/css/select2.min.css");
    const SELECT2_JS  = createSrc('js',"//cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/js/select2.min.js");
    const QUICKSEARCH_JS = createSrc('js',"//cdnjs.cloudflare.com/ajax/libs/jquery.quicksearch/2.3.1/jquery.quicksearch.min.js");

    // jqueryがロードされているかチェック
    return new Promise(function(fulfilled, rejected){
        //jqueryが読み込まれていなければ読み込み
        if(jQuery){
            resolve();
        }else{
            reject();
        }
    //jquery なければ読み込み
    }).then(

        // 成功時の処理（なにもしない）
        function(){}

        // 失敗時の処理（jqueryロード）
        ,function(){
            return onloadSrc('jquery',JQUERY_JS)
        }

    // cdnロード
    ).then(function(res){
        return Promise.all([
            // select2Js
            onloadSrc('SELECT2_JS',SELECT2_JS)
            // SELECT2_CSS
            ,onloadSrc('SELECT2_CSS',SELECT2_CSS)
            // jquery-quicksearch
            ,onloadSrc('QUICKSEARCH_JS',QUICKSEARCH_JS)
        ]);
    })

}



/**
 * ショートカットキーの適用
 * @return {[type]} [description]
 */
function applyShortcutKeys(){
    // 次へキーへショートカットをセット
    setAccessKey('goNext','n');
    // 前へキーへショートカットをセット
    setAccessKey('goPrevious','p');
    // 保存キーへショートカットをセット
    setAccessKey('save','s');

    // 保存＆次へもN
    setAccessKey('save_new','n');


    // 前へキーへショートカットをセット
    setAccessKey('cancel','c');

    jQuery('input[name=\'memorize\']').on('click',function(){return confirmOnSave()});

    jQuery(window).keydown(function(e){
        if(event.altKey){
            if(e.keyCode === 66){
            var $focus = jQuery('input[type=\'submit\']');
            console.log($focus);

            // var $target;
            // console.log($focus);
            // // console.log($focus[0]);
            // $target = $focus.nextAll('input[type=\'submit\']');
            // jQuery(":focus").css("background-color","#FCC");
            // jQuery(":not(':focus')").css("background-color","#FFF");
            // // if($focus){
            // //   $target = jQuery($focus.nextAll('input[type=\'submit\']')[0]);
            // // }else{
            // //   $target = jQuery(jQuery('input[type=\'submit\']')[0]);
            // // }
            // $target.focus();
            // console.log($target.text());
            return false;
            }
        }
    });
}


/**
 * select2適用処理
 * @return {[type]} [description]
 */
function applySelect2(){
    //-------------------------------------------------------------//
    // select2適用処理
    //-------------------------------------------------------------//
    var selector = '*:not(div.datePicker) select';
    selector     += ':visible';
    selector     += ":not('.select2-hidden-accessible')";
    selector     += ":not([multiple='multiple'])";
    selector     += ":not([id='colselector_select_1'])";
    selector     += ":not([id='duel_select_1'])";

    jQuery(selector).select2({
        dropdownAutoWidth:true
    // ,allowClear:true
        }
    )

}

/**
 * 変更セット用カスタマイズ
 * @return {[type]} [description]
 */
function applyHenkoSetPageCustom(){
    // if ( (thisPageUrl.indexOf('salesforce.com/p/mfpkg/AddToPackageFromChangeMgmtUi') != -1) && (thisPageUrl.indexOf('rowsperpage=1000') == -1)) {
    if ( (thisPageUrl.indexOf('salesforce.com/p/mfpkg/AddToPackageFromChangeMgmtUi') != -1)) {
        var actionStr = jQuery('#editPage').attr('action');
        if(actionStr.indexOf('rowsperpage=') == -1){
            actionStr += '&rowsperpage=1000';
        }else{
            actionStr = actionStr.replace(/rowsperpage=[0-9]+/ig,'rowsperpage=1000');
        }
        jQuery('#editPage').attr('action',actionStr);

        // 「増やす」があれば押す(一度も押していないときのみ)
        // if(jQuery('.moreArrow').length>0 && (thisPageUrl.indexOf('rowsperpage=') == -1)){
        //     console.log('変更セット画面を1000件表示にする処理');
        //     var baseUrl   = jQuery('img.moreArrow').closest('a')[0].href;
        //     // document.getElementsByClassName('moreArrow')[0].click();
        //     var newUrl    = baseUrl.replace(/rowsperpage=[0-9]+/ig,'rowsperpage=1000');
        //     //ソート条件がなければオブジェクト名ソートにする
        //     location.href = newUrl;
        // }
    }
}



//とちゅう(たぶんセッションIDがちがう)
function delbuttonAdd(){
    var pageId    = thisPageUrl.replace('https://','');
    var pageUrls  = pageId.split('/');
    var pageUrls2 = pageUrls[1].split('?');
    pageId        = pageUrls2[0];
    var delUrl    = '/setup/own/deleteredirect.jsp?' +
    'setupid=CustomObjects'+
    '&delID=' + pageId+
    // '&retURL=%2F01IN00000009Yn7%3Fsetupid%3DCustomObjects'+
    '&_CONFIRMATIONTOKEN=' + getSessionId();
    createCustomLink(document.getElementById('topButtonRow'),delUrl,'削除','_self');
    //セッションID取得
    function getSessionId(){
        var sid = document.cookie.substring(
          document.cookie.indexOf("=",document.cookie.indexOf("sid=")) + 1,
          document.cookie.indexOf(";",document.cookie.indexOf("sid="))
        );
        return sid;
    }


    /**
     * リンク作成
     * @param  {[type]} palentEle [description]
     * @param  {[type]} url       [description]
     * @param  {[type]} title     [description]
     * @param  {[type]} target    [description]
     * @return {[type]}           [description]
     */
    function createCustomLink(palentEle,url,title,target) {
        console.log('createCustomLink');
        var ele       = document.createElement("a");
        ele.href      = url;
        ele.innerText = '■' + title;
        ele.target    = target;
        ele.style     = 'margin-right:5px'
        palentEle.appendChild(ele);
    }
}



/**
 * ライブラリ要素作成
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
function createSrc(strType,url){
    var scr;
    if(strType == 'js'){
        scr     = document.createElement("script");
        scr.src = url;

    }else if(strType == 'css'){
        scr      = document.createElement("link");
        scr.rel  = "stylesheet";
        scr.href = url;
    }
    return scr;
}


/**
 * ライブラリを非同期で読み込む
 * @param  {[type]} srcName [description]
 * @param  {[type]} src     [description]
 * @return {[type]}         [description]
 */
function onloadSrc(srcName,src) {
return new Promise(function(resolve, reject) {
    // 要素追加
    document.body.appendChild(src);
    // ロード後の処理
    src.onload = function (event) {
        // console.log(srcName + 'の読み込み成功');
        resolve(srcName + 'の読み込み成功');
    }
    // エラー時の処理
    src.onerror = function (event) {
        // console.log(srcName + 'の読み込みに失敗しました');
        reject(srcName + 'の読み込みに失敗しました');
    }
   });
}



/**
 * css追加
 */
function addCssRules(){
    //レポート用cssカスタマイズ
    if ( (thisPageUrl.indexOf('LayoutMappingUI') == -1) ) {


        var scr    = document.createElement('style');
        scr.type   = "text/css";



        scr.onload = function(){
            var addRule =  "table.reportTable tr:hover td";
            addRule += ",table.reportTable tr:hover td";
            addRule += ",table.detailList tr.dataRow:hover td";
            addRule += " {background-color: #D6ECF2!important;}";
            // addRule += " {background-color: #D6ECF2!important;}";

            // var addRule2 = "input[type='search']::-webkit-search-cancel-button {-webkit-appearance: searchfield;}";
            // var addRule3 = "input[type='search'] {-webkit-appearance: searchfield-cancel-button;}";
    //     ,'-webkit-appearance': 'searchfield'

            // addRule += " {background-color: #D6ECF2!important;}";

            // var rule2 = " .select2-container.select2-selection--single {box-sizing: border-box;cursor: pointer;display: block;height: 20px;user-select: none;-webkit-user-select: none;}";
            // var rule3 = ".select2-container--default.select2-selection--single.select2-selection__rendered {color: #444;line-height: 20px;}";
            // var rule4 += ".select2-container--default .select2-selection--single .select2-selection__arrow {height: 18px;position: absolute;top: 1px;right: 1px;width: 20px;}";
            // var rule5 += ".select2-container .select2-selection--single .select2-selection__rendered {display: block;padding-left: 4px;padding-right: 20px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;}";

            // addRule += ".select2-container.select2-selection--single {box-sizing: border-box;cursor: pointer;display: block;height: 20px;user-select: none;-webkit-user-select: none;}";
            // addRule += ".select2-container--default.select2-selection--single.select2-selection__rendered {color: #444;line-height: 20px;}";
            // addRule += ".select2-container--default.select2-selection--single.select2-selection__arrow {height: 18px;position: absolute;top: 1px;right: 1px;width: 20px;}";
            // addRule += ".select2-container.select2-selection--single.select2-selection__rendered {display: block;padding-left: 4px;padding-right: 20px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;}";
            var stylesheet = document.styleSheets.item(0);
            document.styleSheets.item(0).insertRule(addRule,stylesheet.cssRules.length);
            // document.styleSheets.item(0).insertRule(addRule2,stylesheet.cssRules.length);
            // document.styleSheets.item(0).insertRule(addRule3,stylesheet.cssRules.length);
        }
        document.getElementsByTagName('head').item(0).appendChild(scr);
    }
}

/**
 * ヘッダ固定：何をしようとしていたか思い出せない
 */
function addFixedHeaderTable(){
    var scr    = document.createElement("script");
    scr.src    = "//cdnjs.cloudflare.com/ajax/libs/fixed-header-table/1.3.0/jquery.fixedheadertable.min.js";
    scr.onload = function(){
        console.log('addFixedHeaderTable-onload');
        try{
            // setTimeout(mainScript(),0);
        }catch(e){
            console.log('addFixedHeaderTable適用エラー',e)
        }
    }
    document.body.appendChild(scr);
}

/**
 * いろんなショートカットの追加
 */
function setSettingPageLink(){
    //デフォルト、フィードベース、編集ページ対応
    jQuery('div.bPageBlock td.labelCol,div.entityFeedLayout td.labelCol').each(function(index){
        var urls = jQuery(this).next('td').prop('id').split('_');
        var url  = '/' + urls[0];
        url      = url.replace(/CF/g,'');
        if(url.length<=15){return true;}
        jQuery(this).wrapInner('<a href="'+url+'" target="_blank" style="font-weight: normal;"/>');
        // console.log(this);
    })

    if(thisPageUrl.indexOf('PublishFieldsUi') != -1){
        //例外対応（stosページへの対応）
        //デフォルト、フィードベース、編集ページ対応
        // alert(1);
        jQuery('td.dataCol').each(function(index){
            // var urls = jQuery(this).next('td').prop('id').split('_');
            var label = jQuery(this).find('label');
            var url = label.prop('for');
            url = '/' + url;
            url      = url.replace(/CF/g,'');
            if(url.length<=15){return true;}
            jQuery(this).append(' →<a href="'+url+'" target="_blank" style="font-weight: normal;">check</a>');
            // console.log(this);
        })
    }

}


/**
 * 全選択のチェックボックスの処理を上書き
 * @return {[type]} [description]
 */
function overwriteAllSelectCheckBox(){
    // console.log('overwriteAllSelectCheckBox-Start');
    // console.log(toggleAllRows);

    if(typeof SelectAllOrNoneByCheckbox == "function"){
        //通常版
        SelectAllOrNoneByCheckbox = function(){
            var thisEle   = event.target;
            var isChecked = jQuery(thisEle).prop('checked');
            //通常用selector:[name="ids"]:visible,[name="LayoutNameids"]:visible
            //変更セットプロファイル選択ページ用selector:td.actionColumn input[type="checkbox"]:visible
            //共通？:td.actionColumn input[type="checkbox"]:visible ←問題なければこちらに置き換え
            jQuery(thisEle).closest('table').find('td.actionColumn input[type="checkbox"]:visible').prop('checked',isChecked);
        }

    }else if(typeof toggleAllRows == "function"){
        //変更セットプロファイル選択ページ版
        // var defaultFnc2 = toggleAllRows;
        toggleAllRows   = function(){
            SelectAllOrNoneByCheckbox();
        }
    }



}




/**
 * ヘッダ行の固定たぶんいらない
 * @return {[type]} [description]
 */
function fixedHeaderRow(){
    // var jQuerylastWidget = jQuery('tr.headerRow')[0];
    var headerRow     = jQuery('tr.headerRow')[0];
    var jQuerynameCol = jQuery('th.nameCol');
    // jQuery(headerRow).closest('table').css('table-layout','fixed');
    jQuery(headerRow).each(function(){
        jQuery(this).find('th').each(function(){
            console.log(String(jQuery(this).width())+'px');
            jQuery(this).css({
                minWidth :String(jQuery(this).innerWidth())+'px'
                ,maxWidth:String(jQuery(this).innerWidth())+'px'
            });
        });
    });

    var fixedWidth  = jQuerynameCol.innerWidth() + 'px';
    var fixedHeight = jQuerynameCol.innerHeight() + 'px';
    jQuerynameCol.each(function(index, el) {
        jQuery(this).css({
            minWidth  :fixedWidth
            ,maxWidth :fixedWidth
            ,minHeight:fixedHeight
            ,maxHeight:fixedHeight
        });
    });
    var distanceFromTheTop  = headerRow.getBoundingClientRect().top + window.pageYOffset;
    var distanceFromTheLeft = jQuerynameCol[0].getBoundingClientRect().left + window.pageXOffset;

    window.onscroll = function(){
        if( window.pageYOffset > distanceFromTheTop ) {
            jQuery(headerRow).css({
                position:'fixed'
                ,top:0
            });
            // this.setAttribute( 'class', 'fixedWidget' );
        } else {
            jQuery(headerRow).css('position','relative');
            // this.setAttribute( 'class', '' );
        }

        if( window.pageXOffset > distanceFromTheLeft ) {
            jQuerynameCol.css({
                position:'fixed'
                ,left:0
            });
        } else {
            jQuerynameCol.css('position','relative');
            // this.setAttribute( 'class', '' );
        };
    }

}

/**
 * jQuery quick search適用処理
 * @return {[type]} [description]
 */
function applyJqueryQuickSearch(){
    var targetTableLength = 0;  //テーブルが～行以上のときだけ適用する。（-1の場合制限なし）
    // jqs適用のためのクラスを追加
    var selector       = 'table.list:visible';                              //関連リスト等
    selector           += ',table.reportTable:visible';                     //レポート
    selector           += ',select[multiple="multiple"]:visible';           //複数選択リスト
    selector           += ',table.selectWrapper select';                    //複数選択リスト

    var targetChildren = 'tbody tr:not(.headerRow)';                        //table用
    targetChildren     += ',option';                                        //selectbox用

    //テーブルを検索して検索欄を挿入
    jQuery(selector).each(function(index){
        var $targetEle      = jQuery(this);
        var childrenLength = $targetEle.find(targetChildren).length;
        var jqsClassName   = 'jqs-'+ index;
        var searchTextCrearId   = 'searchTextCrear-button-'+ index;
        var tableSelectButtonId   = 'tableSelect-button-'+ index;
        if(childrenLength-1 <= targetTableLength){return true;} //theadがなくheader含めtbodyに入っているため、length-1が実際の行数
        var addEleStr = '<div class="jqs-div"><input type="search" class="jqueryQuickSearch jqs-' + index;
        // addEleStr     += '" placeholder="絞込み(全' + childrenLength +'件)"'
        addEleStr     += '" placeholder="絞込み(全' + childrenLength +'件)"';
        addEleStr     += '/>'
        // addEleStr     += '<span>' + childrenLength +'件</span>';
        // addEleStr     += '<button type="button" onclick="selectDomElm(jQuery(\'table.'+ jqsClassName + '\')[0])">select</button></div>';
        // addEleStr     += '<div class="clearButton"/>';
        addEleStr     += '<button type="button" id="' + searchTextCrearId + '">×</button>';
        addEleStr     += '<button type="button" id="' + tableSelectButtonId + '">select table</button></div>';
        $targetEle.before(addEleStr);    //検索欄追加
        $targetEle.addClass('jqs');
        $targetEle.addClass('jqs-'+ index);
//      $targetEle.find('tr.headerRow th').each(function(index){
//          jQuery(this).append('<input type="checkbox" onclick="hideCol(this)"/>');
//      });
        $targetEle.css('width',$targetEle.width() + 'px');

        jQuery('#' + tableSelectButtonId).on("click",function(event){
            selectDomElm(jQuery('table.'+ jqsClassName)[0]);
        });

        jQuery('input.jqs-' + index).on("keyup",function(event){
            delSpaces(this);
        });

        jQuery('#' + searchTextCrearId).on("click",function(event){
            jQuery('input.jqs-' + index).val('');
            jQuery('input.jqs-' + index).change();
            jQuery('input.jqs-' + index).focus();
        });


        // targetInd++;
    })

    //検索欄とテーブルが1対1で対応するようにする（これがないと1つの検索欄ががすべてのテーブルに影響する）
    jQuery('input.jqueryQuickSearch').each(function(index){
        // jQuery(this).quicksearch('table.jqs-'+index+' tbody tr.dataRow', {
        var targetChildrenSelector = 'table.jqs-' + index + ' tbody tr:not(.headerRow)';
        targetChildrenSelector     += ',select.jqs-' + index + ' option';
        jQuery(this).quicksearch(targetChildrenSelector, {
            'delay'     :300
            ,'stripeRows':['odd','even']
            ,'loader'    :'span.loading'        // ローディング画像（オプション）
            ,'noResults' : 'tr#noresults'       // 「結果なし」の表示（オプション）
            ,'bind'      :'keyup click change'  // どのタイミングでフィルタ処理するか
        // 'onAfter':function(){
        //         jQuery('span.jqs-length-' + index).text($targetEle.find(targetChildren).length);
        //     }
        });

    });

    // jQuery('input.jqueryQuickSearch').css({
    //     'padding-right':'20px'
    //     ,'width':'120px'
    //     ,'-webkit-appearance': 'searchfield'
    // });
    // jQuery('input.jqueryQuickSearch::-webkit-search-cancel-button').css({
    //     '-webkit-appearance': 'searchfield-cancel-button'
    // });
    // jQuery('div.jqs-div').css({
    //     'position':'relative'
    // });

    // jQuery('div.clearButton').css({
    //   'width': '13px'
    //   ,'height': '13px'
    //   ,'position': 'absolute'
    //   ,'right': '2px'
    //   ,'top': '1px'
    //   ,'background': 'url(clear.png) no-repeat left center'
    //   ,'cursor': 'pointer'

    // });

}


/**
 * 保存時に確認msgを表示する
 * @return {[type]} [description]
 */
function confirmOnSave(){
    return confirm('上書き保存してよろしいですか？')
}


//-------------------------------------------------------------//
// imageなどのtabindexを-1にする
//-------------------------------------------------------------//
function applyTabindexCustom(){
    // var exCludeSelector = 'form img';
    // exCludeSelector     += ',form a';
    // exCludeSelector     += ',form .mouseOverInfoOuter';

    var exCludeSelector = 'img';
    exCludeSelector     += ',a';
    exCludeSelector     += ',div.mouseOverInfoOuter';   //divすべてにするとへんなことになる

    jQuery(exCludeSelector).attr('tabIndex','-1');
}

/**
 * フォーカスを特定フォームの最初の入力要素にセットする
 */
function setFocusToFirstFormInput(){
    var $settingform = jQuery('#stageForm');
    // console.log($settingform);
    if($settingform){
        // 最初のinput
        $settingform.find(':input:visible:not([type=\'submit\']):first').eq(0).focus();
    }
}


//-------------------------------------------------------------//
// 次へボタンにショートカットキーでアクセスできるようにする
//-------------------------------------------------------------//
function setAccessKey(nameStr,key){
    jQuery('[name=\'' + nameStr + '\']').attr('ACCESSKEY',key);
}



//-------------------------------------------------------------//
// 先頭にスペースが入っていたら消す(jquery-quicksearch用)
//-------------------------------------------------------------//
function delSpaces(ele){
    var str = ele.value;
    str = str.replace(/\t/g,'');
    str = str.replace(/\n/g,'');
    ele.value = str.trim();
    // console.log('searchval:' + str);
}

var tableSelectionFlg = false;
// ココがポイントjavascript
function selectDomElm(obj){
    // Rangeオブジェクトの取得
    // Selectionオブジェクトを返す。ユーザが選択した範囲が格納されている
    var selection = window.getSelection();
    // 選択をすべてクリア
    selection.removeAllRanges();
    if(!tableSelectionFlg){
        var range = document.createRange();
        // range.selectNodeContents(this);
        range.selectNode(obj);
        selection.addRange(range);
    }

}




//選択した列を非表示にする
function hideCol(obj){
    console.log(obj);
    var $tableEle = jQuery(obj).closest('table');
    var tdEle = jQuery(obj).closest('td,th')[0];
    var cellInd = tdEle.cellIndex;
    //cellindexが一致したら非表示にする
    $tableEle.find('td,th').each(function(){
        if(this.cellIndex == cellInd){
            jQuery(this).css('display','none');
        }

    });
    console.log(tdEle);

}




/**
 * jQuery quick search適用処理
 * @return {[type]} [description]
 */
function profileFormCopyButtonAdd(){
    if ( (thisPageUrl.indexOf('e?s=ObjectsAndTabs') == -1) ) {
        return;
    }

    var PROCESSNAME = 'permition_obj';

    var selector       = 'div.pc_page_ObjectsAndTabs form';    //関連リスト等

    // 英語表記
    var TAB_SETTING = 'Tab Settings';
    var RECORD_SETTING = 'Record Types and Page Layout Assignments';
    var OBJECT_SETTING = 'Object Permissions';
    var FIELD_SETTING = 'Field Permissions';

    // // 日本語表記
    // var TAB_SETTING = 'Tab Settings';
    // var RECORD_SETTING = 'Record Types and Page Layout Assignments';
    // var OBJECT_SETTING = 'Object Permissions';
    // var FIELD_SETTING = 'Field Permissions';



    //テーブルを検索して検索欄を挿入
    jQuery(selector).each(function(index){
        // console.log('form');
        var $form = jQuery(this);
        var PERMITION_OBJ_OUTPUT_BUTTON_ID = PROCESSNAME + '_output_button_' + index;
        var PERMITION_OBJ_OUTPUT_TEXTAREA_ID = PROCESSNAME + '_output_textarea_' + index;
        var PERMITION_OBJ_INPUT_TEXTAREA_ID = PROCESSNAME + '_input_textarea_' + index;
        var PERMITION_OBJ_INPUT_BUTTON_ID = PROCESSNAME + '_input_button_' + index;
        // addEleStr     += '<div><button type="button" onclick="inputScriptCreateFnc(document.getElementById(' + targetId + '))">copy</button></div>';
        var addElementStr = '<div><button type="button" id="' + PERMITION_OBJ_OUTPUT_BUTTON_ID + '">output</button></div>';
        addElementStr     += '<p>output</p><textarea id="' + PERMITION_OBJ_OUTPUT_TEXTAREA_ID + '" readonly="true"/>';
        addElementStr     += '<div><button type="button" id="' + PERMITION_OBJ_INPUT_BUTTON_ID + '">input</button></div>';
        addElementStr     += '<p>input</p><textarea id="' + PERMITION_OBJ_INPUT_TEXTAREA_ID + '"/>';

        $form.before(addElementStr);   //コピーボタン追加

        var $tabSettingTrs = $form.find('h3:contains(\'' + TAB_SETTING + '\')').parent('div').parent('div').find('div.pbSubsection table.detailList table:visible>tbody>tr');
        var $recordTypeTrs = $form.find('h3:contains(\'' + RECORD_SETTING + '\')').parent('div').parent('div').find('div.pbSubsection table.detailList table:visible>tbody>tr');
        var $objPermTrs    = $form.find('h3:contains(\'' + OBJECT_SETTING + '\')').parent('div').parent('div').find('div.pbSubsection table.detailList table:visible>tbody>tr');
        var $fieldTrs      = $form.find('h3:contains(\'' + FIELD_SETTING + '\')').parent('div').parent('div').find('div.pbSubsection table.detailList table.list:visible>tbody>tr');

        jQuery('#' + PERMITION_OBJ_INPUT_BUTTON_ID).on("click",function(event){
            var inputStr = jQuery('#' + PERMITION_OBJ_INPUT_TEXTAREA_ID).val();
            var rows = inputStr.split('\n');
            var $trs;

            var recTrIndexs = [];
            var objTrIndexs = [];
            var fieldTrIndexs = [];

            for(var i=0;i<rows.length;i++){
                var cells = rows[i].split('\t');
                var strType = cells[0];
                var inputLabel = cells[1];
                var targetTd;

                if(!inputLabel){continue;}
                var $targetTr;

                switch(strType){
                    case 'tab':
                        // var inputValue = cells[2];
                        // $trs = $tabSettingTrs;
                        // var $targetTd = $trs.find('td:nth-of-type(1):contains(' + inputLabel + ')');
                        // if($targetTd[0] != null){
                        //  var $targetTr = $targetTd.closest('tr');
                        //  $targetTr.find('td:nth-of-type(1)').val(inputValue);
                        // }

                        // console.log($trs.find('td:nth-of-type(1):contains(' + label + ')'));
                        break;

                    case 'recordtype':
                        var inputText = cells[2];
                        var selectValue = cells[3];
                        var recordValue;
                        var defaultValue;
                        if(cells[4] != null){
                            recordValue = (cells[4] == 'true') ? true : false;
                            defaultValue = (cells[5] == 'true') ? true : false;
                        }

                        $recordTypeTrs.find('td:nth-of-type(1)').each(function(rowIndex){
                            if(jQuery.inArray(rowIndex,recTrIndexs) != -1){
                                return true;
                            }

                            if(inputLabel == this.innerText){
                                console.log(rowIndex + ',' + inputLabel + '----' + this.innerText);
                                targetTd = this;
                                recTrIndexs.push(rowIndex);
                                return false;
                            }
                        });


                        if(targetTd != null){
                            $targetTr = jQuery(targetTd).parent('tr');
                            $targetTr.find('td:nth-of-type(2) select:visible').val(selectValue);

                            if(cells[4]!=null){
                                $targetTr.find('td:nth-of-type(3) input:visible').prop('checked',recordValue);
                                $targetTr.find('td:nth-of-type(4) input:visible').prop('checked',defaultValue);
                            }
                        }

                        break;

                    case 'objct':
                        var isActiveValue = (cells[2] == 'true') ? true : false;
                        $objPermTrs.find('td:nth-of-type(1)').each(function(rowIndex){
                            if(jQuery.inArray(rowIndex,objTrIndexs) != -1){
                                return true;
                            }

                            if(inputLabel == this.innerText){
                                console.log(rowIndex + ',' + inputLabel + '----' + this.innerText);
                                targetTd = this;
                                objTrIndexs.push(rowIndex);
                                return false;
                            }
                        });


                        if(targetTd != null){
                            $targetTr = jQuery(targetTd).parent('tr');
                            $targetTr.find('td:nth-of-type(2) input:visible').prop('checked',isActiveValue);
                        }

                        break;

                    case 'field':
                        var isRead = (cells[2] == 'true') ? true : false;
                        var isEdit = (cells[3] == 'true') ? true : false;
                        $fieldTrs.find('td:nth-of-type(1)').each(function(rowIndex){
                            if(jQuery.inArray(rowIndex,fieldTrIndexs) != -1){
                                return true;
                            }

                            if(inputLabel == this.innerText){
                                console.log(rowIndex + ',' + inputLabel + '----' + this.innerText);
                                targetTd = this;
                                fieldTrIndexs.push(rowIndex);
                                return false;
                            }
                        });


                        if(targetTd != null){
                            $targetTr = jQuery(targetTd).parent('tr');
                            $targetTr.find('td:nth-of-type(2) input:visible').prop('checked',isRead);
                            $targetTr.find('td:nth-of-type(3) input:visible').prop('checked',isEdit);
                        }

                        break;

                }

            }
        });

        // outputのアクション
        jQuery('#' + PERMITION_OBJ_OUTPUT_BUTTON_ID).on("click",function(event){
            var resultStr = '';
            var resultStrCsv = '';

            // pc_rt table(レコードタイプとページレイアウトの割り当て)の値を取得
            // タブの設定
            $tabSettingTrs.each(function(index){
                var tabText          = '';
                var tabSelected      = jQuery(this).find('td:nth-of-type(1) select:visible option:selected');
                var tabSelectedValue = jQuery(this).find('td:nth-of-type(1) select:visible').val();
                var lineStr          = '';

                if(tabSelected[0] != null){
                    tabText = tabSelected.text();
                }
                var trValues = [];
                trValues.push('tab');
                trValues.push(tabText);
                trValues.push(tabSelectedValue);

                lineStr   = trValues.join('\t');
                lineStr   = lineStr.replace(/\n/g, '');
                resultStr += lineStr + '\n';
            });

            // レコードタイプとページレイアウトの割り当て
            $recordTypeTrs.each(function(index){
                var label           = jQuery(this).find('td:nth-of-type(1)')[0].innerText;
                var wariateSelected = jQuery(this).find('td:nth-of-type(2) select:visible option:selected');
                var wariateText     = '';
                if(wariateSelected[0] != null){
                    wariateText = wariateSelected.text();
                }
                var wariateValue  = jQuery(this).find('td:nth-of-type(2) select:visible').val();
                var recordTypeEle = jQuery(this).find('td:nth-of-type(3) input:checkbox:visible')[0];
                var recordType    = jQuery(this).find('td:nth-of-type(3) input:checkbox:visible').prop('checked');
                var defaultRadio  = jQuery(this).find('td:nth-of-type(4) input:radio:visible').prop('checked');
                var lineStr = '';

                var trValues = [];
                if(label){
                    trValues.push('recordtype');
                    trValues.push(label);
                    trValues.push(wariateText);
                    trValues.push(wariateValue);

                    if(recordTypeEle){
                        trValues.push(recordType);
                        trValues.push(defaultRadio);
                    }

                    resultStr += joinTabAndFormat(trValues);
                }
            });

            // オブジェクト権限
            $objPermTrs.each(function(index){
                console.log(index);
                var label = jQuery(this).find('td:nth-of-type(1)')[0].innerText;
                var isActive = jQuery(this).find('td:nth-of-type(2) input:checkbox:visible').prop('checked');
                var lineStr = '';

                var trValues = [];
                if(label){
                    trValues.push('objct');
                    trValues.push(label);
                    trValues.push(isActive);

                    resultStr += joinTabAndFormat(trValues);
                }
            });

            // 項目権限
            $fieldTrs.each(function(index){
                var label = jQuery(this).find('td:nth-of-type(1)')[0].innerText;
                var readAccess = jQuery(this).find('td:nth-of-type(2) input:checkbox:visible').prop('checked');
                var editAccess = jQuery(this).find('td:nth-of-type(3) input:checkbox:visible').prop('checked');
                var lineStr = '';

                var trValues = [];
                if(label){
                    trValues.push('field');
                    trValues.push(label);
                    trValues.push(readAccess);
                    trValues.push(editAccess);

                    resultStr += joinTabAndFormat(trValues);
                }
            });
            console.log(resultStr);
            jQuery('#' + PERMITION_OBJ_OUTPUT_TEXTAREA_ID).val(resultStr);

        });

    });
}

// 渡されたリストをタブで区切り文字列変換 + 行内の改行除去 + 末尾に改行追加
function joinTabAndFormat(strList){
    var result = strList.join('\t');
    return result.replace(/\n/g, '') + '\n';
}


function selectorEscape(val){
    return val.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}
