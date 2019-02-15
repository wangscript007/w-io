var deptRolesHandleType;
var systemDeptRoleData;
function deptTreeShow(data){
	systemDeptRoleData = data;
	var bodydivs = $("#bodydivs");
	var rightmouse = $("<div id='deptrMenu' class='rMenu'><ul><li data-method='setTop' id='addDeptWindow'" +
			" >增加节点</li>" +
			"<li data-method='setTop' id='updateDeptWindow'>修改节点</li><li id='deleteOneDept'>删除节点</li></ul></div>");
	bodydivs.append(rightmouse);
	addDeptWindow();
	
	var setting = {
			check: {
				enable: true
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onRightClick: deptRoleTreeRightClick,
				onClick:deptroleTreeOnClick
			}
		};

	var zNodes = [];
	var dataLen = data.length;
	for(var i=0;i<dataLen;i++){
		zNodes[i] = {'id':data[i]['id'],'pId':data[i]['pid'],'name':data[i]['name'],'isend':data[i]['isend']};
	}
	$.fn.zTree.init($("#deptstree"), setting, zNodes);
	var deptrolesearchname = $("#deptrolesearchname");
	deptrolesearchname.on('input',function(){
		wiosearch({
			'url':'/search',//url
			'data':{},//参数
			'outinput':[deptrolesearchname],//回绑的对象
			'title':['name'],//表头对应的key
			'titlename':['部门名称'],//表头的名称
			'inputobj':deptrolesearchname,//输入的对象
		    'pobj':$("#bodydivs"),//上层对象
		    'width':'200',
		    'height':'200',
		    'callback':function(){
		    	searchDeptRole();
		    }
		},systemDeptRoleData);
	});
	function deptroleTreeOnClick(event, treeId, treeNode, clickFlag) {
		$.ajax({
      		url:'/dept_deptGetUsers',
      		data:{'deptid':treeNode.id,'sessionId':123123},
      		type:'post',
      		dataType:'json',
      		success:function(data){
      			var userZTree = $.fn.zTree.getZTreeObj("userstree");
      			var checkedNodes = userZTree.getCheckedNodes(true);
      			var checkedNodesLen = checkedNodes.length;
      			for(var i=0;i<checkedNodesLen;i++){
      				userZTree.checkNode(checkedNodes[i],false,true);
      			}
      			var dataLen = data.length;
      			for(var j=0;j<dataLen;j++){
  					var userid = data[j]['userid'];
  					var node = userZTree.getNodeByParam('id',userid,null);
  					if(node != null){
  						node.checked = true;
  						userZTree.updateNode(node,true);
  						userZTree.selectNode(node);
  						userZTree.cancelSelectedNode(node);
  					}
  				}
      		}
      	})
	}
}
function deptRoleTreeRightClick(event, treeId, treeNode){
	var zTree = $.fn.zTree.getZTreeObj("deptstree");
	if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
		zTree.cancelSelectedNode();
		deptshowRMenu("root", event.clientX, event.clientY);
	} else if (treeNode && !treeNode.noR) {
		zTree.selectNode(treeNode);
		deptshowRMenu("node", event.clientX, event.clientY);
	}
}
function deptshowRMenu(type, x, y) {
	$("#deptrMenu ul").show();
	if (type=="root") {
		$("#m_del").hide();
		$("#m_check").hide();
		$("#m_unCheck").hide();
	} else {
		$("#m_del").show();
		$("#m_check").show();
		$("#m_unCheck").show();
	}

    y += document.body.scrollTop;
    x += document.body.scrollLeft;
    $("#deptrMenu").css({"top":y+"px", "left":x+"px", "visibility":"visible"});

	$("body").bind("mousedown", deptonBodyMouseDown);
}
function deptonBodyMouseDown(event){
	if (!(event.target.id == "deptrMenu" || $(event.target).parents("#deptrMenu").length>0)) {
		$("#deptrMenu").css({"visibility" : "hidden"});
	}
}
function searchDeptRole(){//查询部门
	var val = $("#deptrolesearchname").val();
	var zTree = $.fn.zTree.getZTreeObj("deptstree");
	var nodes = zTree.getNodesByParamFuzzy('name',val,null);
	if(nodes.length > 0){
		zTree.selectNode(nodes[0]);
	}
}
var deptTreeEditactive = {
    setTop: function(){
      var arrays  = new Array();
      var str = showEditDeptForm(arrays);
      var that = this; 
      //多窗口模式，层叠置顶
      var index = layer.open({
        type: 1 
        ,title: '添加部门'
        ,area: ['580px', '560px']
        ,shade: 0
        ,maxmin: true
        ,offset: [ 
          Math.random()*($(window).height()-300)
          ,Math.random()*($(window).width()-390)
        ] 
        ,content: str
        ,btn: ['保存', '全部关闭'] //只是为了演示
        ,yes: function(){
        	var addDeptJson = $("#"+arrays[0]).serializeObject();
        	var pid = $("#"+arrays[0]).attr("pId");
        	addDeptJson['pid'] = pid;
        	addDeptJson['sessionId'] = '123123';
        	addDeptJson['systemname'] = 'system';
        	var deptRolesHandleType = $("#"+arrays[0]).attr("deptRolesHandleType");
        	//树节点操作
        	var handleTreeFun;
        	var zTree = $.fn.zTree.getZTreeObj("deptstree");
  			var selectedNodes = zTree.getSelectedNodes();
        	if(deptRolesHandleType == 'add'){
        		var urls = '/dept_addDept';
        		handleTreeFun = function(newNode){
        			zTree.addNodes(selectedNodes[0], newNode);
        			systemDeptRoleData[systemDeptRoleData.length] = newNode;
        		}
        	}else if(deptRolesHandleType == 'update'){
        		var urls = '/dept_updateDept';
        		addDeptJson['id'] = addDeptJson['pid'];
        		handleTreeFun = function(newNode){
        			selectedNodes[0].name = newNode.name;
        			zTree.updateNode(selectedNodes[0]);
        			var systemDeptRoleDataLength = systemDeptRoleData.length;
        			for(var i=0;i<systemDeptRoleDataLength;i++){
        				if(systemDeptRoleData[i].id == newNode.id){
        					systemDeptRoleData[i] = newNode;
        					break;
        				}
        			}
        		}
        	}
        	$.ajax({
	      		url:urls,
	      		data:addDeptJson,
	      		type:'post',
	      		dataType:'json',
	      		success:function(data){
	      			var newNode = data['retBean'][0];
	      			newNode['pId'] = pid;
	      			handleTreeFun(newNode);//修改或者新增
	      			var msg;
	      			if(data['type'] == 'success'){
	      				msg = '操作成功';
	      				layer.close(index);
	      			}else{
	      				msg = '操作失败';
	      			}
	      			layer.open({
	      			   content: msg
	      			});
	      		}
	      	})
        }
        ,btn2: function(){
          layer.closeAll();
        }
        ,zIndex: layer.zIndex //重点1
        ,success: function(layero){
	          layer.setTop(layero); //重点2
	          $.ajax({
	      		url:'/dept_getDeptOtherDatas',
	      		data:{'sessionId':'123123'},
	      		type:'get',
	      		dataType:'json',
	      		success:function(data){
	      			var forms = $("#"+arrays[0]);
	      			var depttypeselect = forms.find("[name='depttype']");
	      			depttypeselect.empty();
	      			var deptTypeBean = data['deptTypeBean'];
	      			var dataLen = deptTypeBean.length;
	      			for(var i=0;i<dataLen;i++){
	      				var cd = deptTypeBean[i];
	      				var option = $("<option value='"+cd['id']+"'>"+cd['depttype']+"</option>");
	      				depttypeselect.append(option);
	      			}
	      			var deptpropertyselect = forms.find("[name='deptproperty']");
	      			deptpropertyselect.empty();
	      			var dataProperty = data['deptPropertyBean'];
	      			var dplen = dataProperty.length;
	      			for(var i=0;i<dplen;i++){
	      				var cd = dataProperty[i];
	      				var option = $("<option value='"+cd['id']+"'>"+cd['deptproperty']+"</option>");
	      				deptpropertyselect.append(option);
	      			}
	      			
	      			if($("#"+arrays[0]).attr("deptRolesHandleType") == 'update'){
	      				$.ajax({
	      		      		url:'/dept_getOneDeptRole',
	      		      		data:{'sessionId':'123123','id':$("#"+arrays[0]).attr("pId")},
	      		      		type:'get',
	      		      		dataType:'json',
	      		      		success:function(data){
	      		      			var datas = data['data'][0];
	      		      			fillForm(forms,datas);
		      		      		layui.use('form', function(){
		  		  	          	  var form = layui.form; //只有执行了这一步，部分表单元素才会自动修饰成功
		  		  	          	  form.render();
		  		  	    		}); 
	      		      		}
	      		      	})
	      			}else{
		      			layui.use('form', function(){
		  	          	  var form = layui.form; //只有执行了这一步，部分表单元素才会自动修饰成功
		  	          	  form.render();
		  	    		}); 
	      			}
	      		}
	      	})
        }
      });
    }
  }
function addDeptWindow(){
	//触发事件
    $('#addDeptWindow').on('click', function(){
    	$("#deptrMenu").css({"visibility" : "hidden"});
    	deptRolesHandleType = 'add';
        var othis = $(this), method = othis.data('method');
        deptTreeEditactive[method] ? deptTreeEditactive[method].call(this, othis) : '';
        layui.use('form', function(){
        	  var form = layui.form; //只有执行了这一步，部分表单元素才会自动修饰成功
        	  form.render();
        }); 
    });
    $('#updateDeptWindow').on('click', function(){
    	$("#deptrMenu").css({"visibility" : "hidden"});
    	deptRolesHandleType = 'update';
    	var othis = $(this), method = othis.data('method');
        deptTreeEditactive[method] ? deptTreeEditactive[method].call(this, othis) : '';
        layui.use('form', function(){
        	  var form = layui.form; //只有执行了这一步，部分表单元素才会自动修饰成功
        	  form.render();
        });
    });
    $("#deleteOneDept").on('click',function(){
    	$("#deptrMenu").css({"visibility" : "hidden"});
    	deleteOneDeptRoleData();
    });
    //按钮组
    $("[rolebtgroup='deptsmd']").find("button").eq(0).click(function(){
    	var userZTree = $.fn.zTree.getZTreeObj("userstree");
    	var userSelects = userZTree.getCheckedNodes(true);
    	var userSelectsLen = userSelects.length;
    	var userZTreeSelectJson = [];
    	for(var i=0;i<userSelectsLen;i++){
    		var cnode = userSelects[i];
    		if(cnode.isend == '1'){
	    		var id = cnode.id;
	    		userZTreeSelectJson[userZTreeSelectJson.length] = id;
    		}
    	}
    	var deptZTree = $.fn.zTree.getZTreeObj("deptstree");
    	var deptSelects = deptZTree.getCheckedNodes(true);
    	var deptSelectsLen = deptSelects.length;
    	var deptSelectsSelectJson = [];
    	for(var i=0;i<deptSelectsLen;i++){
    		var cnode = deptSelects[i];
    		if(cnode.isend == '1'){
	    		var cnode = deptSelects[i];
	    		var id = cnode.id;
	    		deptSelectsSelectJson[deptSelectsSelectJson.length] = id;
    		}
    	}
    	var jsons = {};
    	if(deptSelectsSelectJson.length>1){
    		layer.open({
    			content:"抱歉，当前按钮只允许单个部门对多个用户进行授权"
    		})
    		return;
    	}
    	var userZTreeSelectJsonLen = userZTreeSelectJson.length;
    	var userZTreeSelects = '';
    	for(var i=0;i<userZTreeSelectJsonLen;i++){
    		userZTreeSelects += userZTreeSelects == '' ? userZTreeSelectJson[i] : (","+userZTreeSelectJson[i]);
    	}
    	jsons['deptid'] = deptSelectsSelectJson[0];
    	jsons['userids'] = userZTreeSelects;
    	jsons['sessionId'] = '123123';
    	$.ajax({
    		url:'/dept_deptSetUser',
    		type:'post',
    		data:jsons,
    		dataType:'json',
    		beforeSend:function (R) {
    			R.setRequestHeader('Connection', 'Keep-Alive');//复用连接
    		},
    		success:function(data){  
    			if(data['type'] == '1'){
    				layer.msg("操作成功");
    			}else{
    				layer.msg("操作失败");
    			}
    		}
    	})
    })
}
function showEditDeptForm(array){
	var id = uuid(32,10);
	array[0] = id;
	var zTree = $.fn.zTree.getZTreeObj("deptstree");
	var selectedNodes = zTree.getSelectedNodes();
	return "<form class='layui-form' style='margin-top:10px;' id='"+id+"' pId='"+selectedNodes[0].id+"' " +
			"deptRolesHandleType='"+deptRolesHandleType+"'>" +
				"<div class='layui-form-item'>" +
					"<label class='layui-form-label'>部门名称</label>" +
					"<div class='layui-input-block'>" +
						"<input type='text' name='name' lay-verify='title' " +
							"autocomplete='off' placeholder='请输入部门名称' class='layui-input'>" +
					"</div>" +
				"</div>" +
				"<div class='layui-form-item' style='display:none;'>" +
					"<div class='layui-input-block'>" +
						"<input type='text' name='pid' lay-verify='title' class='layui-input'>" +
					"</div>" +
				"</div>" +
				"<div class='layui-form-item'>" +
					"<label class='layui-form-label'>部门类型</label>" +
					"<div class='layui-input-block'>" +
						"<select name='depttype' lay-filter=''>" +
							"<option value=''></option>" +
						"</select>" +
					"</div>" +
				"</div>" +
				"<div class='layui-form-item'>" +
					"<label class='layui-form-label'>部门属性</label>" +
					"<div class='layui-input-block'>" +
						"<select name='deptproperty' lay-filter=''>" +
							"<option value=''></option>" +
						"</select>" +
					"</div>" +
				"</div>" +
				"<div class='layui-form-item'>" +
					"<label class='layui-form-label'>是否末级</label>" +
					"<div class='layui-input-block'>" +
						"<select name='isend' lay-filter=''>" +
							"<option value='0'>否</option>" +
							"<option value='1'>是</option>" +
						"</select>" +
					"</div>" +
				"</div>" +
			"</form>";
}
function deleteOneDeptRoleData(){
	var zTree = $.fn.zTree.getZTreeObj("deptstree");
	var selectedNodes = zTree.getSelectedNodes();
	var id = selectedNodes[0].id;
	$.ajax({
  		url:"/dept_deleteDatas",
  		data:{'id':id,'sessionId':'123123'},
  		type:'post',
  		dataType:'json',
  		success:function(data){
  			if(data['type'] == 'success'){
  				zTree.removeNode(selectedNodes[0]);
  				var systemDeptRoleDataLength = systemDeptRoleData.length;
  				for(var i=0;i<systemDeptRoleDataLength;i++){
    				if(systemDeptRoleData[i].id == id){
    					systemDeptRoleData.splice(i,1);
    					break;
    				}
    			}
  			}
  		}
	})
}







