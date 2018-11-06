
(function () {

//Defining namespace
    var stickyNotes = function () {

        return {

            variables: {
                "db": '',
                "id": '',
                "length": '',
                "text_remaining": '',
                result: [],
                addNoteFlag: true
            },

            dbOps: function () {
                var self = this;
                var openRequest = window.indexedDB.open("myDB4.db", 1);

                openRequest.onsuccess = function (event) {
                    self.variables.db = event.target.result;
                    console.log("DB successfully loaded");

                    setTimeout(function () {
                        self.getNote();
                    }, 100);

                };

                openRequest.onerror = function (event) {

                };

                openRequest.onupgradeneeded = function (event) {
                    self.variables.db = event.target.result;
                    console.log("DB created/initialized");
                    if (!self.variables.db.objectStoreNames.contains("noteTable")) {
                        self.variables.db.createObjectStore("noteTable", {keyPath: "Index", autoIncrement: true});
                    }
                    //db.deleteObjectStore("noteTable");

                };

            },
            addNote: function (obj) {
                var self = this;
                var length = $('#text-count').attr("maxlength");
                $('#text-count').html(length);
                var transaction = this.variables.db.transaction(["noteTable"], "readwrite");
                var objectStore = transaction.objectStore("noteTable");
                var openRequest = objectStore.add(obj);
                openRequest.onsuccess = function (event) {
                    setTimeout(function () {
                        self.getNote();
                    }, 100);

                };
            },

//getNote function will get the notes from indexDB and display in UI
            getNote: function () {
                this.variables.result = [];
                var a = 1;
                console.log('inside addNote');
                var transaction = this.variables.db.transaction(["noteTable"], "readonly");
                var objectStore = transaction.objectStore("noteTable");
                var openRequest = objectStore.openCursor();

                $("#tbl").empty();
                var self = this;
                openRequest.onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        self.variables.result.push(cursor.value);

                        $("#tbl").append("<tr><td>" + a + "</td><td><div class='note'>" +
                            "<p>Subject: " + cursor.value.noteSubj + "</p>" +
                            "<p>Message: " + cursor.value.noteMsg + "</p>" + " <p> Message Length: " + cursor.value.noteLen + "</p>" +
                            "<strong>Author: " + cursor.value.noteAuth + "</strong>" + " <span>, " + cursor.value.time + "</span>" +
                            "</div></td><td><button type='button' data-toggle='modal' data-target='#myModal' class='edit-btn btn btn-primary' data-index='" + cursor.value.Index + "'" + "id='edit-btn" + cursor.value.Index + "'" + ">Edit</button> " +
                            "<button type='button' class='del-btn btn btn-danger' data-index='" + cursor.value.Index + "'" + "id='del-btn'>Delete</button></td></td></tr>");
                        //$('#pid').val('value')
                        a++;
                        // $('#tbl').append("<tr><td>"+a+"<tr></td>")
                        cursor.continue();
                    }
                    var len = self.variables.result.length;
                    $("#tot-count").text(len);
                };
            },

//editNote function will allow the user to edit note
            editNote: function (obj) {
                var transaction = this.variables.db.transaction(["noteTable"], "readwrite");
                var objectStore = transaction.objectStore("noteTable");

                var openRequest = objectStore.put(obj);
                var self = this;
                setTimeout(function () {
                    self.getNote();
                }, 100);

            },

//delNote function will delete the note
            delNote: function (id) {
                var transaction = this.variables.db.transaction(["noteTable"], "readwrite");
                var objectStore = transaction.objectStore("noteTable");
                var openRequest = objectStore.delete(id);
                var self = this;
                openRequest.onsuccess = function (event) {
                    $(".alert-msg").append("Note successfully Deleted");
                    // report the success of the delete operation
                    //note.innerHTML += '<li>Record deleted.</li>';
                    console.log(event.target.result);
                    setTimeout(function () {
                        self.getNote();
                    }, 100);

                };

                openRequest.onerror = function (event) {
                    alert("Error deleting");
                };

            },


//getData function will get the data from DOM
            getData: function () {
//validating for script tags with RegEx
                var subj = $("#noteSubjectField").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                var msg = $("#noteMessageField").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                var auth = $("#authorNameField").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");

//validating for script tags with jquery
                //var encodedMsg = $('<div />').text(msg).html();
                //var encodedAuth = $('<div />').text(auth).html();
                var d = new Date();

                var length = $('#noteMessageField').val().length;

                var timeStamp = d.toLocaleDateString() + ", " + d.toLocaleTimeString();
                return {
                    noteSubj: subj,
                    noteMsg: msg,
                    noteAuth: auth,
                    noteLen: length,
                    time: timeStamp
                }
            },

//showAlert function will show animated alerts
            showAlert: function (msg) {
                $('.alert strong').text(msg);
                $('.alert').slideDown(500).delay(2000).slideUp(500)
            },


//getEditNote function will get the data saved in array from the DOM
            getEditNote: function (row) {

                $("#noteSubjectField").val(row.noteSubj);
                $("#noteMessageField").val(row.noteMsg);
                $("#authorNameField").val(row.noteAuth);

                $("#noteSubjectField").attr('data-Index', row.Index)
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
                    $("#authorNameField").val('');
                });

                $(document).on("click", ".submit-btn", function () {
            
                    $('#myModal').modal('hide');
                });

                $(document).on("click", ".edit-btn", function () {

                    self.variables.addNoteFlag = false;
                    self.variables.id = Number(($(this).attr('data-index')));

                    var row = self.variables.result.filter(function (obj) {
                        return obj.Index === self.variables.id;

                    });

                    //self.textCount(row[0]);
                    self.getEditNote(row[0]);
                    self.messageCount();
                });

                $(document).on("click", ".del-btn", function () {
                    $('#confirm-delete').modal('show');
                    var id = Number(($(this).attr('data-index')));
                    $('#note-delete').attr('data-index', id);
                });

                $(document).on('click', '#note-delete', function () {
                    self.variables.id = Number($('#note-delete').attr('data-index'));
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
    stickyNotes.dbOps();
    stickyNotes.clickOps();

}());


