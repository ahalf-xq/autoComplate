/**
 *AutoComplate
 *You Nedd:
 *1.a input with class 'msds' or 'hjcs';
 *2.a listContainer to show your query result
 *I use it in my proj for querying Physico-chemical parameter of material when I input a material name and
 *querying the environmental parameter when I input a region name
 */
(function() {
    var autocomplete = function(_input, _listContainer) {
        var input = _input,
            listContainer = _listContainer,
            me = this,
            listHtml = '',
            listTop, listLeft, listWidth,
            lastInputTime = null,
            timeoutId,
            userInputed = '',
            searchType = 1;   //1--MSDS;2--HJCS

        //gives a default list if the input is empty when I focus in the input
        if (input.hasClass('msds')) {
            searchType = 1;
        } else if (input.hasClass('hjcs')) {
            searchType = 2;
        }
        input.bind('mousedown', function(e) {
            if (input.val() === '') {
                switch (searchType) {
                    case 1:
                        listHtml = '<tr mc="甲醇"><td>甲醇</td></tr>' +
                        '<tr mc="乙醇"><td>乙醇</td></tr>' +
                        '<tr mc="甲烷"><td>甲烷</td></tr>' +
                        '<tr mc="苯"><td>苯</td></tr>' +
                        '<tr mc="氨"><td>氨</td></tr>';
                        break;
                    case 2:
                        listHtml = '<tr mc="南京"><td>南京</td></tr>' +
                        '<tr mc="北京"><td>北京</td></tr>' +
                        '<tr mc="上海"><td>上海</td></tr>' +
                        '<tr mc="广州"><td>广州</td></tr>' +
                        '<tr mc="杭州"><td>杭州</td></tr>';
                        break;
                }
                showList();
            }
        });
        //
        input.bind('keyup', function(e) {
            var orderKey = e.which,
                nextSibling, preSibling, curSelItem = listContainer.find('tr.mo');
            switch (orderKey) {
                case 38:
                    if (listContainer.find('tr').length > 0) {
                        if (curSelItem.length > 0) {
                            preSibling = curSelItem.prev();
                            if (typeof(preSibling) !== typeof(undefined)) {
                                curSelItem.addClass('ml').removeClass('mo');
                                preSibling.removeClass('ml').addClass('mo');
                            } else {
                                input.val(userInputed);
                                return;
                            }
                        } else {
                            preSibling = listContainer.find('tr:last').removeClass('ml').addClass('mo');
                        }
                        input.val(preSibling.attr('mc'));
                    }
                    break;
                case 40:
                    if (listContainer.find('tr').length > 0) {
                        if (curSelItem.length > 0) {
                            nextSibling = curSelItem.next();
                            if (typeof(nextSibling) !== typeof(undefined)) {
                                curSelItem.addClass('ml').removeClass('mo');
                                nextSibling.removeClass('ml').addClass('mo');
                            } else {
                                input.val(userInputed);
                                return;
                            }
                        } else {
                            nextSibling = listContainer.find('tr:first').removeClass('ml').addClass('mo');
                        }
                        input.val(nextSibling.attr('mc'));
                    }
                    break;
                case 13:
                    if (curSelItem.length > 0) {
                        input.blur();
                        if (typeof(curSelItem.attr('dbId')) !== typeof(undefined)) {
                            doRequest(true, curSelItem.attr('dbId'));
                        } else {
                            doRequest(false, curSelItem.attr('mc'));
                        }
                    }
                    break;
                case 23:
                    listContainer.hide('fast');
                    break;
                default:
                    changInputAndQuery();
                    break;
            }
        });
        
        input.bind('blur', function() {
            listContainer.hide('fast');
        });

        function changInputAndQuery() {
            var resData = {},
                i, resDataLen,
                reqData = {},
                curInputValue = input.val(),
                url = '',
                curInputTime = new Date().getTime(),
                timeOutTime = 0;
            
            if (lastInputTime !== null) {
                if (curInputTime - lastInputTime < 500) {
                    clearTimeout(timeoutId);
                    timeOutTime = 500;
                }
            }

            lastInputTime = curInputTime;
            switch (searchType) {
                case 1:
                    reqData.wzmc = curInputValue;
                    url = '/api/professional/knowledge/msds/search';
                    break;
                case 2:
                    reqData.dq = curInputValue;
                    url = '/api/professional/knowledge/hjcsk/search';
                    break;
            }
            userInputed = curInputValue;

            if (curInputValue !== '') {
                timeoutId = setTimeout(function() {
                    $.ajax({
                        async: false,
                        type: 'GET',
                        url: url,
                        data: reqData,
                        success: function(data) {
                            if (data.success) {
                                resData = data.data;
                            } else {
                                $.alert(data.error);
                                return false;
                            }
                        }
                    });

                    listHtml = '';
                    if (typeof(resData) !== typeof(undefined)) {
                        switch (searchType) {
                            case 1:
                                for (i = 0, resDataLen = resData.length ; i < resDataLen ; i++) {
                                    listHtml += '<tr dbId="' + resData[i].id + '" mc="' +
                                        resData[i].chinesename + '"><td>' +
                                        resData[i].chinesename + '</td></tr>';
                                }
                                break;
                            case 2:
                                for (i = 0, resDataLen = resData.length ; i < resDataLen ; i++) {
                                    listHtml += '<tr dbId="' + resData[i].id + '" mc="' +
                                        resData[i].quyumingcheng + '"><td>' +
                                        resData[i].quyumingcheng + '</td></tr>';
                                }
                                break;
                        }
                    }
                    showList();
                }, timeOutTime);
            } else {
                input.mousedown();
            }
        }

        function showList() {
            listContainer.empty();
            if (listHtml !== '') {
                listContainer.append('<table id="listTable" cellspacing="0" cellpadding="2">' +
                    listHtml + '</table>');
                locatePanel();
                listContainer.css({
                    'top': listTop,
                    'left': listLeft,
                    'width': listWidth
                }).show('fast');
            } else {
                listContainer.hide('fast');
            }
        }

        (function bindListEvent() {
            listContainer.delegate('tr', 'mouseover', function() {
                listContainer.find('tr.mo').removeClass('mo').addClass('ml');
                $(this).removeClass('ml').addClass('mo');
            }).delegate('tr', 'mouseleave', function() {
                $(this).removeClass('mo').addClass('ml');
            }).delegate('tr', 'mousedown', function() {
                input.val($(this).attr('mc')).blur();
                if (typeof($(this).attr('dbId')) !== typeof(undefined)) {
                    doRequest(true, $(this).attr('dbId'));
                } else {
                    doRequest(false, $(this).attr('mc'));
                }
            });
        })();

        function doRequest(useIdSearch, reqValue) {
            var reqData = {},
                url = '';
            switch (searchType) {
                case 1:
                    if (useIdSearch) {
                        reqData.id = reqValue;
                    } else {
                        reqData.chinesename = reqValue;
                    }
                    url = '/api/professional/knowledge/msds/getOne';
                    break;
                case 2:
                    if (useIdSearch) {
                        reqData.id = reqValue;
                    } else {
                        reqData.quyumingcheng = reqValue;
                    }
                    url = '/api/professional/knowledge/hjcsk/getOne';
                    break;
            }

            $.ajax({
                async: false,
                type: 'GET',
                url: url,
                data: reqData,
                success: function(data) {
                    if (data.success) {
                        //Do something use data.data
                    } else {
                        $.alert(data.error);
                        return false;
                    }
                }
            });
        }

        function locatePanel() {
            listTop = input.position().top + input.height() + 4;
            listLeft = input.position().left;
            listWidth = input.width();
        }

        return me;
    };

    $.fn.autoComplete = function(listContainer) {
        var input = this;
        return new autocomplete(input, listContainer);
    };
}());