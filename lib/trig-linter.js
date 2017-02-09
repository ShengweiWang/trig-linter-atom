'use babel';
import { CompositeDisposable } from 'atom';

import * as helpers from  'atom-linter';
import * as trigParser from 'js-trig-parser';


export default {

  subscriptions: null,

  activate(state) {

    require('atom-package-deps').install('trig-linter-atom')
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'my-package:toggle': () => this.toggle_change()
    }));
  },

  deactivate() {
    // this.modalPanel.destroy();
    this.subscriptions.dispose();
    // this.trigLinterView.destroy();
  },

  toggle_change() {
      editor = atom.workspace.getActiveTextEditor()
      words = editor.getText()
      pattern = new Array();
      replace = new Array();
      // pattern[0] = /<([^>:]*)\:([^>]*)>/g
      // replace[0] = "<$1%3A$2>"
      pattern[0] = /<http://([^>+]*)\+([^>]*)>/g
      replace[0] = "<http://$1%2B$2>"
      pattern[1] = /<http://([^>?]*)\?([^>]*)>/g
      replace[1] = "<http://$1%3F$2>"
      pattern[2] = /<http://([^>=]*)\=([^>]*)>/g
      replace[2] = "<http://$1%3D$2>"
      pattern[3] = /<http://([^>&]*)\&([^>]*)>/g
      replace[3] = "<http://$1%26$2>"
      // pattern[5] = /<([^> ]*)\ ([^>]*)>/g
      // replace[5] = "<$1%3F$2>"
      buffer = editor.getBuffer()
      for (var i = 0; i < 4; i = i + 1) {
        buffer.replace(pattern[i], replace[i])
      }
    // console.log(words.replace(pattern, "<$1%3F$2>"));
    ss0 = "<http://www.w3.org/1999/02/22-rd%3F-sy%3FFntax-ns#>"
      ss = "<http://www.w3.org/1999/02/22-rd%2BFf-syntax-ns#>"
      ss1 = "<http://www.w3.org/1999/02/22-rd%2BDf-syntax-ns#>"
      ss2 = "<http://www.w3.org/1999/02/22-rd%3D6f-syntax-ns#>"
    // console.log('MyPackage was toggled!222');
    // this.myPackageView.setCount(20)

    return (
      1
    );
  },

  provideLinter() {


    return {
      name: "TrigLinter",
      grammarScopes : ['source.trig','source.trtl','source.turtle'],
      scope: 'file',
      lintOnFly: true,
      gutterEnabled: true,
      underlineIssues: true,
      lintOnFlyInterval: 1500,
      showErrorPanel:true,
      showErrorInline:true,
      lint: async (textEditor) => {
        const filePath = textEditor.getPath();
        const text = textEditor.getText();


        if (text.length === 0) {
          return Promise.resolve([]);
        }

        return new Promise(function(resolve, reject){
            setTimeout(function(){
              reject('Timeout on lint of : ' + filePath);
            },5000);

            var results = trigParser.loaders.graphLoader.fromString(text);
            var syntaxErrors = results.syntaxErrors.map(function(se){
              console.log('syntaxErrors')
              console.log(se)
                var line = se.line - 1;
                var col = se.column;
                return {
                  type: 'Error',
                  text: se.msg, filePath,
                  range: helpers.rangeFromLineNumber(textEditor, line, col)
                };
            });

            var analysisErrors = results.analysisErrors.map(function(se){

                var line = se.line - 1;
                var col = se.column;
                var len = se.len || (se.start ? se.start.stop - se.start.start: 1);
                var range = [[line,col],[line, col + len]];
                return {
                  type: 'Warning',
                  text: se.message , filePath,
                  range: range
                };
            });
            var errors = results.errors.map(function(se){
                console.log('error')
                console.log(se)
                var line = se.symbol.line - 1;
                var col = se.symbol.column;
                var len = se.len || (se.symbolstart ? se.start.symbol.stop - se.symbol.start.start: 1);
                var range = [[line,col],[line, col + len]]
                return {
                    type: 'Error',
                    text: se.symbol._text, filePath,
                    range: range
                };
            });

            var allErrors = errors.concat(syntaxErrors).concat(analysisErrors).filter(function(m){
              if(!m.text){
                console.error("error without text");
                console.error(m);
              }
              return m.text;
            });
            console.log(allErrors);
            resolve(allErrors);
        });



      }
    }
  }
};
