{pkgs}: let
  pname = "HnJobs";
  vsextensions =
    (with pkgs.vscode-extensions; [
      ms-vsliveshare.vsliveshare
      redhat.vscode-yaml
      vscodevim.vim
      charliermarsh.ruff
      github.copilot

      ms-vscode.live-server

      aaron-bond.better-comments
      christian-kohler.npm-intellisense
      dbaeumer.vscode-eslint
      eamodio.gitlens
      formulahendry.auto-rename-tag
      mhutchie.git-graph
      mikestead.dotenv
      ms-azuretools.vscode-docker
      ms-kubernetes-tools.vscode-kubernetes-tools
      ms-python.python
      ms-python.vscode-pylance
      naumovs.color-highlight
      oderwat.indent-rainbow
      streetsidesoftware.code-spell-checker
      tabnine.tabnine-vscode
      vincaslt.highlight-matching-tag
      vscode-icons-team.vscode-icons
      matangover.mypy

      timonwong.shellcheck
      foxundermoon.shell-format
      kamadorueda.alejandra
      jnoortheen.nix-ide
    ])
    ++ pkgs.vscode-utils.extensionsFromVscodeMarketplace [
      {
        publisher = "andys8";
        name = "jest-snippets";
        version = "1.9.1";
        sha256 = "sha256-CcjhmvJzlDQcOxbeA/bZ6W4HqVnoluDETPRIOIuMMgM=";
      }
      {
        publisher = "chakrounanas";
        name = "turbo-console-log";
        version = "2.10.4";
        sha256 = "sha256-6CMnEGss4XkDau6Wn4equMJWoQtSjMgQ15Y7TK3mZvk=";
      }
      {
        publisher = "donjayamanne";
        name = "python-extension-pack";
        version = "1.7.0";
        sha256 = "sha256-ewOw6nMVzNSYddLcCBGKVNvllztFwhEtncE2RFeFcOc=";
      }
      {
        publisher = "dsznajder";
        name = "es7-react-js-snippets";
        version = "4.4.3";
        sha256 = "sha256-QF950JhvVIathAygva3wwUOzBLjBm7HE3Sgcp7f20Pc=";
      }
      {
        publisher = "frhtylcn";
        name = "pythonsnippets";
        version = "1.0.2";
        sha256 = "sha256-b5oQURlhmADwDjuP8KHfqqT195TMoIhtVI87sJLf0lw=";
      }
      {
        publisher = "kisstkondoros";
        name = "vscode-codemetrics";
        version = "1.26.1";
        sha256 = "sha256-lw6eZwlMXEjaT+FhhmiLkCB49Q7C015vU7zOLLTtGf8=";
      }
      {
        publisher = "pflannery";
        name = "vscode-versionlens";
        version = "1.14.2";
        sha256 = "sha256-R6AhteWfZpMTBvztQH6o/cq6ljderg6E4rzbthcJrmQ=";
      }
      {
        publisher = "rvest";
        name = "vs-code-prettier-eslint";
        version = "6.0.0";
        sha256 = "sha256-PogNeKhIlcGxUKrW5gHvFhNluUelWDGHCdg5K+xGXJY=";
      }
      {
        publisher = "ryanluker";
        name = "vscode-coverage-gutters";
        version = "2.11.1";
        sha256 = "sha256-Ne80F5BkAlzeEqAaJErlzTdlv8RDMwShgrVPaSYqRYg=";
      }
      {
        publisher = "salbert";
        name = "comment-ts";
        version = "1.0.21";
        sha256 = "sha256-iO6Ruvmxxp346I9IoED+BMmpUQ006lZVVQitlCJY5Gc=";
      }
      {
        publisher = "shanoor";
        name = "vscode-nginx";
        version = "0.6.0";
        sha256 = "sha256-HjtRfG669VunZvF62hVDKThzwweun+dDLEszc+WlDA0=";
      }
      {
        publisher = "yzhang";
        name = "markdown-all-in-one";
        version = "3.6.2";
        sha256 = "sha256-BIbgUkIuy8clq4G4x1Zd08M8k4u5ZPe80+z6fSAeLdk=";
      }
      {
        publisher = "amatiasq";
        name = "sort-imports";
        version = "6.3.1";
        sha256 = "sha256-w02bnJH3wfZsTMwDbrlc6UdVhh+equqnF9cnkOhQciU=";
      }
      {
        publisher = "mrmlnc";
        name = "vscode-scss";
        version = "0.10.0";
        sha256 = "sha256-Iuirq+SUZz3V6QHeZNyj9EaWSszL4fD4cdorcMnbbSI=";
      }
      {
        publisher = "ckolkman";
        name = "vscode-postgres";
        version = "1.4.3";
        sha256 = "sha256-OCy2Nc35vmynoKxoUoTL2qyUoiByTMMPebEjySIZihQ=";
      }
      {
        publisher = "42Crunch";
        name = "vscode-openapi";
        version = "4.25.2";
        sha256 = "sha256-Nk/lb9ezQt6lWU1A1L6eqI4nBCEkbGyr3xK5C3BhVPw=";
      }
    ];
  hnjobsVsCode = pkgs.vscode-with-extensions.override {
    vscodeExtensions = vsextensions;
  };
  python-pkgs = ps:
    with ps; [
      pip
      virtualenv
      numpy
      pandas
    ];
  plugin-python = pkgs.python310.withPackages python-pkgs;
  vscodeWrapperContent = builtins.readFile "${hnjobsVsCode}/bin/code";
  vscodeExtensionsDir = builtins.match ".*--extensions-dir ([^ ]+).*" vscodeWrapperContent;
  hnjobsCursorScript = pkgs.writeShellScriptBin "cursor" ''
    ${pkgs.code-cursor}/bin/cursor --extensions-dir ${builtins.elemAt vscodeExtensionsDir 0} "$@"
  '';
in
  pkgs.mkShell {
    buildInputs = with pkgs; [
      bashInteractive
      stdenv.cc.cc.lib
    ];

    packages = with pkgs; [
      git

      jq
      yq-go

      nodePackages.prettier
      nodePackages.eslint

      plugin-python

      hnjobsVsCode
      hnjobsCursorScript
      # code-cursor
    ];
  }
