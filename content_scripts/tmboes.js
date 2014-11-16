/**
 * Created by JonXP on 5/17/2014.
 */
if (!window['tmboes']) {
  (function() {
    var typeToExtension = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif"
    };

    var postInfos = {};
    var commentInfos = {};

    var tmboes = {
      convertToDynamicUpload: function (blob, filename) {
        var needsCompression = function(bytesize, width, height) {
          return bytesize / (width * height) > 0.75;
        };

        var needsResize = function(width, height) {
          return height > 1024 || width > 1024;
        };

        var fileInput = document.querySelector("[name=image]");
        var form = fileInput.form;
        var inputContainer = fileInput.parentNode;

        var submitButton = form.querySelector("input[type=submit]");

        inputContainer.removeChild(fileInput);

        var filenameInput = document.querySelector("[name=filename]");
        filenameInput.type = "text";
        filenameInput.value = filename;

        var controls = document.createElement("div");
        form.appendChild(controls);

        var preview = document.createElement("img");
        preview.setAttribute("style", "max-width: 100%");
        preview.addEventListener("load", function() {
          resampleContainer.style.display = needsCompression(blob.size, preview.naturalWidth, preview.naturalHeight) ? "" : "none";
          resizeContainer.style.display = needsResize(preview.naturalWidth, preview.naturalHeight) ? "" : "none";
        });
        preview.src = URL.createObjectURL(blob);

        var resampleContainer = document.createElement("div");
        //resampleContainer.innerHTML = 'File size is large. Resample to JPEG at 90 quality?';
        resampleContainer.style.display = "none";

        var resample = document.createElement("button");
        resample.innerText = "File size (in bytes) is very large. Resample to JPEG at 90 quality?";
        resample.addEventListener("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
          var canvas = document.createElement("canvas");
          canvas.width = preview.naturalWidth;
          canvas.height = preview.naturalHeight;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(preview, 0, 0);
          blob = tmboes.datauriToBlob(canvas.toDataURL("image/jpeg", 0.9));
          resampleContainer.style.display = "none";
          preview.src = URL.createObjectURL(blob);
        });
        resampleContainer.appendChild(resample);
        controls.appendChild(resampleContainer);

        var resizeContainer = document.createElement("div");
        //resizeContainer.innerHTML = 'TMBO thinks your file\'s dimensions are too large. Click "Resize" to make the longest edge 1024px. Do not use this on animated gifs.';
        resizeContainer.style.display = "none";

        var resize = document.createElement("button");
        resize.innerText = "File size (in pixels) is very large. Resize longest edge to 1024px?";
        resize.addEventListener("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
          var canvas = document.createElement("canvas");
          var ratio =  preview.naturalWidth / preview.naturalHeight;
          var newWidth = preview.naturalWidth >= preview.naturalHeight ? 1024 : 1024 * ratio;
          var newHeight = preview.naturalWidth >= preview.naturalHeight ? 1024 / ratio : 1024;
          canvas.width = newWidth;
          canvas.height = newHeight;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(preview, 0, 0, newWidth, newHeight);
          blob = tmboes.datauriToBlob(canvas.toDataURL(blob.type));
          resizeContainer.style.display = "none";
          preview.src = URL.createObjectURL(blob);
        });
        resizeContainer.appendChild(resize);
        controls.appendChild(resizeContainer);

        inputContainer.appendChild(filenameInput);
        form.appendChild(preview);

        form.addEventListener('submit', function (e) {
          e.preventDefault();

          submitButton.disabled = true;

          var progress = document.createElement("progress");

          progress.value = 0;
          progress.max = 100;

          submitButton.parentNode.appendChild(progress);

          var formData = new FormData(form);
          formData.append("image", blob, filename);

          var xhr = new XMLHttpRequest();
          xhr.open('POST', form.action);
          xhr.upload.addEventListener("progress", function(e) {
            if (e.lengthComputable) {
              progress.value = (e.loaded / e.total) * 100;
              progress.textContent = "Uploading: " + progress.value + "%";
            }
          });
          xhr.addEventListener("loadend", function () {
            document.write(this.responseText);
          });
          xhr.send(formData);
        });
      },
      prepareForDynamicUpload: function () {
        var fileInput = document.querySelector("[name=image]");
        fileInput.addEventListener('change', function (e) {
          var files = e.target.files;
          if (files.length == 0) {
            return true;
          }
          var file = files[0];
          if (typeToExtension[file.type]) {
            tmboes.convertToDynamicUpload(file, file.name);
          }
        });
      },
      datauriToBlob: function (datauri) {
        var arrayData = atob(datauri.split(',')[1]);
        var mimeType = datauri.slice(5, datauri.indexOf(';'));
        var ab = new ArrayBuffer(arrayData.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < arrayData.length; i++) {
          ia[i] = arrayData.charCodeAt(i);
        }
        return new Blob([ia.buffer], {type: mimeType});
      },
      typeToExtension: {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif"
      },
      getSetting: function(settingKey, callback) {
        if (!callback)
          return false;

        tmboes.sendMessage("getSetting", settingKey, function(settingObj) {
          callback(settingObj[settingKey]);
        });
      },
      setSetting: function(settingKey, value, callback) {
        if (!callback)
          callback = function(){};
        var settingObj = {};
        settingObj[settingKey] = value;
        tmboes.sendMessage("setSetting", settingObj, callback)
      },
      sendMessage: function(type, payload, callback) {
        var message = {
          type: type,
          payload: payload
        };
        chrome.runtime.sendMessage(message, callback);
      },
      getPostInfo: function(id, callback) {
        if (postInfos[id]) {
          callback(postInfos[id]);
        } else {

          var xhr = new XMLHttpRequest();
          xhr.open('GET', 'https://thismight.be/offensive/api.php/getupload.json?fileid=' + id);
          xhr.addEventListener("loadend", function () {
            var post = JSON.parse(xhr.responseText);
            postInfos[id] = post;
            callback(post);
          });
          xhr.send();
        }
      },
      getCommentInfo: function(id, callback) {
        if (commentInfos[id]) {
          callback(commentInfos[id]);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', 'https://thismight.be/offensive/api.php/getcomments.json?votefilter=c&id=' + id);
          xhr.addEventListener("loadend", function () {
            var comments = JSON.parse(xhr.responseText);
            if (comments.length > 0) {
              commentInfos[id] = comments[0];
              commentInfos[id].comment = tmboes.htmlComment(commentInfos[id].comment);
            }
            callback(commentInfos[id]);
          });
          xhr.send();
        }
      },
      htmlComment: function(commentText) {
        function escapeHtml(str) {
          var div = document.createElement('div');
          div.appendChild(document.createTextNode(str));
          return div.innerHTML;
        }

        commentText = escapeHtml(commentText);

        commentText = commentText.replace(/(http[s]?:\/\/[^\s<>]+)/gi, "<a href=\"$1\" rel=\"nofollow\">$1</a>");

        commentText = commentText.replace(/\n/g, "<br />");

        return commentText;
      },
      enableLinkPreviews: function() {
        document.addEventListener('DOMContentLoaded', function() {
          var infopattern = /^https:\/\/(sandbox\.)?thismight\.be\/.*(c=comments|pic\.php).*/;
          var idpattern = /id=(\d+)/;
          var commentpattern = /#(\d+)$/;


          var infoDiv = document.createElement("div");
          infoDiv.id = "tmboes-info";
          infoDiv.classList.add("hidden");

          document.body.appendChild(infoDiv);

          var mousePos = {
            x: 0,
            y: 0
          };

          function positionInfoDiv() {
            infoDiv.style.top = (mousePos.y - infoDiv.clientHeight - 5) + "px";
            infoDiv.style.left = mousePos.x + "px";
          }

          document.addEventListener('mousemove', function (e) {
            mousePos.y = e.clientY;
            mousePos.x = e.clientX;
            positionInfoDiv();
          }, false);

          function singleCallback(el, type, callback) {
            el.addEventListener(type, function (e) {
              e.target.removeEventListener(e.type, arguments.callee);
              return callback(e);
            });
          }

          document.body.addEventListener('mouseover', function (e) {
            if (e.target.tagName == "A" && infopattern.test(e.target.getAttribute('href'))) {
              e.stopPropagation();
              var id = idpattern.exec(e.target.getAttribute('href'))[1];
              var commentMatch = commentpattern.exec(e.target.getAttribute('href'));

              var finished = false;
              infoDiv.innerHTML = "Loading...";
              infoDiv.classList.toggle("hidden", false);

              tmboes.getPostInfo(id, function (post) {
                if (commentMatch) {
                  tmboes.getCommentInfo(commentMatch[1], function(comment) {
                    renderPreview(post, comment);
                  });
                } else {
                  renderPreview(post, null);
                }
              });

              function renderPreview(post, comment) {
                if (!finished) {
                  infoDiv.innerHTML = tmboes.templates.link_preview.render({
                    filename: post.filename,
                    type: post.type,
                    isImage: post.type == "image",
                    src: post.tmbo || post.nsfw ? '/offensive/graphics/th-filtered.gif' : post.link_thumb,
                    comment: comment
                  });

                  if (post.type == "image") {
                    var img = infoDiv.querySelector("img");
                    img.addEventListener('load', positionInfoDiv);
                  }
                  positionInfoDiv();
                }
              }

              singleCallback(e.target, 'mouseout', function (e) {
                finished = true;
                infoDiv.classList.toggle("hidden", true);
              });
            }
          });
        });
      },
      summarizeVotes: function() {
        var commentList = document.getElementById("commentList");
        if (!commentList)
          return;

        String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };

        // Set scrolling to the element with the given name.
        function jumpToName(name)
        {
          var anchors = document.getElementsByName(name);
          if (!anchors.length)
            return;

          var element = anchors[0];
          var offset = 0;
          while (element)
          {
            offset += element.offsetTop;
            element = element.offsetParent;
          }

          window.scroll(window.scrollX, offset);
        }

        var summaries = {};
        // Increment the counts for the votes that this user posted.
        function updateSummaries(entry)
        {
          var links = entry.getElementsByClassName('userLink');
          if (links.length < 1)
          {
            return;
          }

          var user = links[0];
          var votes = entry.getElementsByClassName('vote');
          for (var i = 0; i < votes.length; i++)
          {
            var vote = votes[i].textContent.trim();
            if (!summaries[vote])
              summaries[vote] = [];
            summaries[vote].push(user);
          }
        }

        function addEntry(entry) {
          // Update summaries based on this post.
          updateSummaries(entry);
        }

        var summarizeToggle = document.createElement('a');
        summarizeToggle.href = "javascript:void(null)";
        summarizeToggle.id = "tmboes-summarizeToggle";

        var summarizeKey = "summarizeVotes";

        function restripeComments() {
          var entries = commentList.querySelectorAll('.entry');
          var stripe = 0;
          for (var i = 0; i < entries.length; ++i)
          {
            var entry = entries[i];
            if (entry.offsetHeight > 0 || entry.offsetWidth > 0) {
              entry.style.backgroundColor = (stripe % 2) == 0 ? '#ccf' : '#bbe';
              stripe += 1;
            }
          }
        }

        function renderSummarizeToggle(callback) {
          tmboes.getSetting(summarizeKey, function (summarize) {
            commentList.classList.toggle('tmboes-summarize', summarize);
            summarizeToggle.innerText = "summarize(" + (summarize ? "on" : "off") + ")";
            restripeComments();
            if (callback) {
              callback();
            }
          });
        }


        // Create an <ul> of the different votes and their voters.
        var ul = document.createElement('ul');

        ul.id = "tmboes-summaries";

        // Add it to the top of the comment list.
        commentList.insertBefore(ul, commentList.querySelector('.entry').previousElementSibling);
        commentList.insertBefore(summarizeToggle, ul);

        function renderSummaries() {
          ul.innerHTML = "";

          // Sort votes and voters.
          sortSummaries();

          for (var summary in summaries)
          {
            var voters = summaries[summary];
            var li = document.createElement('li');

            li.textContent = summary + ' ';
            for (var i = 0; i < voters.length; i++)
            {
              li.appendChild(voters[i].cloneNode(true));
              li.appendChild(document.createTextNode(', '));
            }

            // Remove last separator.
            li.removeChild(li.childNodes[li.childNodes.length - 1]);

            // Add a count of votes
            if (voters.length > 3)
              li.appendChild(document.createTextNode(' (' + voters.length + ' people)'));

            ul.appendChild(li);
          }
        }

        function sortSummaries()
        {
          function byUsername(a, b)
          {
            var anew = a.textContent.toLowerCase();
            var bnew = b.textContent.toLowerCase();
            if (anew < bnew) return -1;
            if (anew > bnew) return 1;
            return 0;
          }

          var sortable = [];
          for (var summary in summaries)
          {
            var voters = summaries[summary];
            voters.sort(byUsername);
            sortable.push([summary, voters]);
          }

          sortable.sort();
          summaries = {};
          for (var i = 0; i < sortable.length; ++i)
            summaries[sortable[i][0]] = sortable[i][1];
        }

        // Go over all the posts, remove empty ones and add them to the summary.
        var entries = commentList.getElementsByClassName("entry");
        if (entries.length <= 1000) {
          for (var i = 0; i < entries.length; ++i) {
            addEntry(entries[i])
          }

          renderSummaries();
          renderSummarizeToggle(function () {
            var hash = window.location.hash;
            if (hash.indexOf('#') == 0)
              hash = hash.substring(1);

            if (hash.length)
              jumpToName(hash);
          });

          summarizeToggle.addEventListener('click', function (e) {
            tmboes.getSetting(summarizeKey, function (summarize) {
              tmboes.setSetting(summarizeKey, summarize ? false : true, function () {
                renderSummarizeToggle();
              });
            });
          });

          var commentAddedHandler = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              for (var i = 0; i < mutation.addedNodes.length; i++) {
                var node = mutation.addedNodes[i];
                if (node.nodeName == "DIV") {
                  addEntry(node);
                }
              }

              renderSummaries();
              restripeComments();
            });
          });

          commentAddedHandler.observe(commentList, {childList: true});
        } else {
          summarizeToggle.innerText = "summarize(disabled - too many comments)";
          summarizeToggle.classList.add('tmboes-disabled');
        }
      }
    };

    function addStyle(cssFile) {
      var style = document.createElement('link');
      style.rel = 'stylesheet';
      style.type = 'text/css';
      style.href = chrome.extension.getURL('styles/' + cssFile);
      (document.head || document.documentElement).appendChild(style);
    }

    var commentExtensions = function() {
      addStyle("comments.css");

      tmboes.enableLinkPreviews();

      document.addEventListener('DOMContentLoaded', function() {
        var lastDiv = null;

        var commentAddedHandler = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
              var node = mutation.addedNodes[i];
              if (node.nodeName == "DIV") {
                node.classList.toggle("tmboes-new", true);
                lastDiv = node;
              }
            }
          });
        });

        function elIsVisible(node) {
          var docViewTop = window.pageYOffset;
          var docViewBottom = docViewTop + window.innerHeight;

          var elemTop = node.offsetTop;
          var elemBottom = elemTop + node.offsetHeight;

          return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
            && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );

        }

        var idleEventHandler = function(e) {
          if (lastDiv && elIsVisible(lastDiv)){
            lastDiv = null;
            var newComments = document.querySelectorAll('.tmboes-new');
            for (var i=0; i<newComments.length; i++) {
              newComments[i].classList.toggle('tmboes-new', false);
            }
          }
        };

        var idleEvents = [
          'mousemove',
          'keydown',
          'DOMMouseScroll',
          'mousewheel',
          'mousedown',
          'touchstart',
          'touchmove'
        ];

        idleEvents.forEach(function(eventType) {
          document.addEventListener(eventType, idleEventHandler);
        });

        var commentList = document.querySelector('#commentList');

        commentAddedHandler.observe(commentList, {childList: true});

        tmboes.summarizeVotes();
      });
    };

    var uploadExtensions = function() {
      document.addEventListener('DOMContentLoaded', function() {
        tmboes.prepareForDynamicUpload();
      });
    };

    var routes = {
      "comments": commentExtensions,
      "upload": uploadExtensions
    };

    function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
      return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var currentPage = getParameterByName('c');

    if (routes[currentPage])
      routes[currentPage]();

    window['tmboes'] = tmboes;
  })();
}