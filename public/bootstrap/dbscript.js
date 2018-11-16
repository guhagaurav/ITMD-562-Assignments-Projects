(function () {

    //Defining namespace
        var stickyNotes = function () {
            
            return {
                variables: {
                    "id": '',
                    "length": '',
                    "text_remaining": '',
                    result: [],
                    addNoteFlag: true
                },

                loginNote: function (loginDetails) {
                    var self = this;
                    console.log(loginDetails)
                    $.ajax({
                        type: 'POST',
                        data: loginDetails,
                        contentType: 'application/json',
                        url: 'http://localhost:3000/api/login',						
                        success: function(data) {
                            console.log(data);
                        }
                    });
                },

   
    
                addNote: function (obj) {
                    var self = this;
                    var length = $('#text-count').attr("maxlength");
                    $('#text-count').html(length);
                    $.ajax({
                        type: 'POST',
                        data: obj,
                        contentType: 'application/json',
                        url: 'http://localhost:3000/api/notes',						
                        success: function(data) {
                            setTimeout(function () {
                                self.getNote();
                            }, 100);
                        }
                    });
                },
    
    //getNote function will get the notes from mongoDB and display in UI
                getNote: function () {
                    this.variables.result = [];
                    $("#tbl").empty();
                    var self = this;
                    $.ajax({
                        type: 'GET',
                        contentType: 'application/json',
                        url: 'http://localhost:3000/api/notes',						
                        success: function(data) {
                        for (let index in data) {
                            self.variables.result.push(data[index])
                            $("#tbl").append("<tr><td>" + index + "</td><td><div class='note'>" +
                            "<p>Subject: " + data[index].subject + "</p>" +
                            "<p>Message: " + data[index].message + "</p>" + " <p> Message Length: " + data[index].noteLength+ "</p>" +
                            "<strong>Author: " + data[index].author + "</strong>" + " <span>, " + data[index].noteTime + "</span>" +
                            "</div></td><td><button type='button' data-toggle='modal' data-target='#myModal' class='btn-sm edit-btn btn btn-primary' data-index='" + index + "'" + "id='edit-btn" + index + "'" + ">Edit</button> " +
                            "<button type='button' class='btn-sm del-btn btn btn-danger' data-index='" + data[index]._id + "'" + "id='del-btn'>Delete</button></td></td></tr>");
                        //$('#pid').val('value')
                        index++;
                        // $('#tbl').append("<tr><td>"+a+"<tr></td>")
                            }
                    var len = data.length;
                    $("#tot-count").text(len);
                        }
                    });
                   
                },
    
    //editNote function will allow the user to edit note
   
    
    //delNote function will delete the note
                delNote: function (id) {
                    var self = this;
                    $.ajax({
                        type: 'DELETE',
                        contentType: 'application/json',
                        url: 'http://localhost:3000/api/notes/'+id,						
                        success: function(data) {
                            setTimeout(function () {
                                self.getNote();
                            }, 100);
                        }
                    });
                },

    
    //getData function will get the data from DOM
                getDataAddNote: function () {
    //validating for script tags with RegEx
                    let subj = $("#noteSubjectField").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    let msg = $("#noteMessageField").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    let auth = $("#noteNameField").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    //validating for script tags with jquery
                    //var encodedMsg = $('<div />').text(msg).html();
                    //var encodedAuth = $('<div />').text(auth).html();
                    let d = new Date();
                    let length = $('#noteMessageField').val().length;
                    let timeStamp = d.toLocaleDateString() + ", " + d.toLocaleTimeString();
                    let data = {};
                    data.subject = subj;
                    data.message = msg;
                    data.author = auth;
                    data.noteLength = length;
                    data.noteTime = timeStamp;
                    return JSON.stringify(data);
                },

                getDataLoginNote: function () {
                    let inputEmail = $("#inputEmail").val();
                    let inputPassword = $("#inputPassword").val();
                    let data = {};
                    data.inputEmail = inputEmail;
                    data.inputPassword = inputPassword;
                    return JSON.stringify(data);
                },
    
    //showAlert function will show animated alerts
                showAlert: function (msg) {      
                    $('.alert.alert-info').text(msg).slideDown(500).delay(2000).slideUp(500);
                },

    //getEditNote function will get the data saved in array from the DOM
                getEditNote: function (row) {
    
                    $("#noteNameField").val(row.author);
                    $("#noteMessageField").val(row.message);
                    $("#noteSubjectField").val(row.subject);
                    $("#noteSubjectField").attr('data-Index-id', row._id)
                },
    
    //clickOps function will handle all the click events.
                clickOps: function () {
                    var self = this;
    
                    $(document).on("click", "#add-note", function () {
                        self.variables.addNoteFlag = true;
                        self.variables.length = $('#text-count').attr("data-max-length");
                        $('#text-count').html(self.variables.length);
                        $("#noteSubjectField").val('');
                        $("#noteMessageField").val('');
                        $("#noteNameField").val('');
                    });

                    $(document).on("click", "#searchbtn", function () {
                        let searchText = $("#searchNote").val();
                        self.searchNote(searchText);
                    });

                    $(document).on("click", "#loginbtn", function () {
            
                        self.loginNote(self.getDataLoginNote());
                    });

                    $(document).on("click", "#submitbtn", function () {
                        if (self.variables.addNoteFlag){
                            self.addNote(self.getDataAddNote());
                            self.showAlert('Note Added Successfully');
                        }
                        else {
                            self.variables.id = $("#noteSubjectField").attr('data-Index-id');
                            let obj = self.getDataAddNote();
                            let jsonObj = JSON.parse(obj)
                            jsonObj.index = self.variables.id;
                            self.editNote(jsonObj);
                            self.showAlert('Note Updated Successfully');
                        }
                        $('#myModal').modal('hide');
                    });
    
                    $(document).on("click", ".edit-btn", function () {
                        self.variables.addNoteFlag = false;
                        self.variables.id = Number(($(this).attr('data-index')));
                        var row = self.variables.result;
                        self.getEditNote(row[self.variables.id]);
                        self.messageCount();
                    });
    
                    $(document).on("click", ".del-btn", function () {
                        $('#confirm-delete').modal('show');
                        var id = $(this).attr('data-index');
                        $('#note-delete').attr('data-index', id);
                    });
    
                    $(document).on('click', '#note-delete', function () {
                        self.variables.id = $('#note-delete').attr('data-index');
                        self.delNote(self.variables.id);
                        self.showAlert('Note Deleted Successfully.');
                        $('#confirm-delete').modal('hide');
                    });
    
                    $(document).on('input', '#noteMessageField', function () {
                        self.messageCount();
                    });
                },
    
                messageCount: function () {
                    var textLength = $('#noteMessageField').val().length;
                    var maxLength = Number($('#text-count').attr("data-max-length"));
                    $("#text-count").text((maxLength - textLength) + " of " + maxLength);
                }
            }
        };
    
        var stickyNotes = new stickyNotes();
        stickyNotes.clickOps();
        stickyNotes.getNote();
        
    
    }());
    
    