(function() {
    var autocomplete = function(_input, _listContainer) {
        var input = _input,
            listContainer = _listContainer,
            me = this,
            listHtml = '',
            listTop, listLeft, listWidth,
            lastInputTime = null,
            timeoutId,
            userInputed = '';

        //gives a default list if the input is empty when I focus in the input
        input.bind('mousedown', function(e) {
            if (input.val() === '') {
                //Here I give a default list of some RegionNames
                listHtml = '<tr mc="NanJing"><td>NanJing</td></tr>' +
                '<tr mc="BeiJing"><td>BeiJing</td></tr>' +
                '<tr mc="ShangHai"><td>ShangHai</td></tr>' +
                '<tr mc="GuangZhou"><td>GuangZhou</td></tr>' +
                '<tr mc="HangZhou"><td>HangZhou</td></tr>';
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
                        //You can add your code here for some expaned function, just like query some info
                        //use the id or mc of the Item you selected
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
                
            reqData.searchKey = curInputValue;
            url = '/api/knowledge/example/search';

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
                        for (i = 0, resDataLen = resData.length ; i < resDataLen ; i++) {
                            listHtml += '<tr dbId="' + resData[i].id + '" mc="' +
                                resData[i].Value + '"><td>' +
                                resData[i].Value + '</td></tr>';
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
                listContainer.append('<table cellspacing="0" cellpadding="2">' +
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
                //You can add your code here for some expaned function, just like query some info
                //use the id or mc of the Item you selected
            });
        })();

        function locatePanel() {
            listTop = input.position().top + input.height() + 4;
            listLeft = input.position().left;
            listWidth = input.width();
        }

        return me;
    };

    $.fn.autoComplete = function(listContainer) {
        var input = this,
            listContainer = $('<div id=' + listContainer + new Date().getTime() + ' class="aCListContainer"></div>');
        listContainer.insertAfter($(this));
        return new autocomplete(input, listContainer);
    };
}());