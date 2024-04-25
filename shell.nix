{ pkgs ? import <nixpkgs> { } }:
let
  pname = "playground";
  vsextensions = (with pkgs.vscode-extensions; [
    ms-azuretools.vscode-docker
    ms-python.python
    ms-python.black-formatter
    ms-python.isort
    ms-vsliveshare.vsliveshare
    redhat.vscode-yaml
    streetsidesoftware.code-spell-checker
    vscodevim.vim
    matangover.mypy
    charliermarsh.ruff
    dbaeumer.vscode-eslint
    esbenp.prettier-vscode
  ]) ++ pkgs.vscode-utils.extensionsFromVscodeMarketplace [
    {
      publisher = "42Crunch";
      name = "vscode-openapi";
      version = "4.25.2";
      sha256 = "sha256-Nk/lb9ezQt6lWU1A1L6eqI4nBCEkbGyr3xK5C3BhVPw=";
    }
    {
          publisher = "gitpod";
          name = "gitpod-desktop";
          version = "0.1.2024020115";
          sha256 = "sha256-s6le2pzRDBc/D1k06CfVTpRmrJThnpqK/YBow6kupkg=";
    }
  ]; 
  vscode-pallon-plugins = pkgs.vscode-with-extensions.override {
    vscodeExtensions = vsextensions;
  };
  python-pkgs = ps: with ps; [
    pip
    virtualenv
    numpy
    pandas
  ];
  plugin-python = pkgs.python310.withPackages python-pkgs;

in

pkgs.mkShell {
  packages = [ plugin-python ];
  buildInputs = with pkgs; [
    git

    black
    isort
    ruff
    mypy

    nodePackages.prettier
    nodePackages.eslint

    vscode-pallon-plugins
  ];
}
