{ pkgs ? import <nixpkgs> { } }:
let
  pname = "HnJobs";
  vsextensions = (with pkgs.vscode-extensions; [
    vscodevim.vim
    ms-vsliveshare.vsliveshare
    ms-azuretools.vscode-docker
    streetsidesoftware.code-spell-checker
    redhat.vscode-yaml
    dbaeumer.vscode-eslint
    esbenp.prettier-vscode
  ]) ++ pkgs.vscode-utils.extensionsFromVscodeMarketplace [
    {
      publisher = "42Crunch";
      name = "vscode-openapi";
      version = "4.25.2";
      sha256 = "sha256-Nk/lb9ezQt6lWU1A1L6eqI4nBCEkbGyr3xK5C3BhVPw=";
    }
  ]; 
  vscode-hnjobs-plugins = pkgs.vscode-with-extensions.override {
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

    jq yq-go

    nodePackages.prettier
    nodePackages.eslint

    vscode-hnjobs-plugins
  ];
}
