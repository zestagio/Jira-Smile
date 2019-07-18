// ==UserScript==
// @name         Jira Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       Yauheni Harbuzau
// @match        https://*.atlassian.net/browse/*
// @match        https://*.atlassian.net/secure/RapidBoard.jspa*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js
// ==/UserScript==
(function (AJS, JIRA) {
  'use strict';

  AJS.$(function () {
    var $title = AJS.$('#jira-issue-container').find('h1');
    if (!$title.length) {
      $title = AJS.$('#jira-issue-changeboarding-banner').next('div').find('h1');
    }

    if ($title.length) {
      gitBranchAndCommit($title);
    }

    AJS.$(document).bind('DOMNodeInserted', function (e) {
      if (AJS.$(e.target).parents('#jira-issue-container').length || AJS.$(e.target).find('#jira-issue-container').length) {
        gitBranchAndCommit(AJS.$(e.target).find('h1'));
      }
    });

    function gitBranchAndCommit($el) {
      if (!$el.closest("div[class^='GridColumnElement__GridColumn']").find('#jira-issue-branch-and-commit').length) {
        var issueKey = window.location.pathname.startsWith('/browse/') ? window.location.pathname.split('/').pop() : JIRA.Issue.getIssueKey();
        var issueTitle = $el.text().trim()
          .replace(/\[.*?\][\s\"\']*/g,'')
          .replace(/\W/g,"-")
          .replace(/_{2,10}/, '-')
          .toLowerCase();

        var content = '<strong>Branch: <span class="copy-me" style="color:#d22;cursor:pointer;">' + issueKey + '-' + issueTitle + '</span></strong><br />';
        content += '<strong>Commit: <span class="copy-me" style="color:#d22;cursor:pointer;">' + issueKey + ': </span></strong>';

        $el.closest("div[class^='GridColumnElement__GridColumn']").prepend('<div id="jira-issue-branch-and-commit">' + content + '</div>');

        AJS.$('span.copy-me').off('click').on('click', function () {
          var $this = AJS.$(this);
          navigator.clipboard.writeText($this.text()).then(function () {
            $this.fadeOut('slow', function () {
              $this.fadeIn('slow');
            });

            AJS.$.notify($this.text() + " copied to clipboard", "success");
          });
        });
      }
    }
  });
})(window.AJS, window.JIRA);
