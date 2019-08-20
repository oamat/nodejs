#!/bin/bash
# script that install all dependencies for dev local 
# In root mode : # sudo -i
#For Minikube Open the sources.list file:  sudo vi /etc/apt/sources.list  
# & Place the following command in the sources.list file: 
                #    deb http://download.virtualbox.org/virtualbox/debian xenial contrib
                #    OR echo "deb http://download.virtualbox.org/virtualbox/debian xenial contrib" >> /etc/apt/sources.list

# DOCKER https://docs.docker.com/install/linux/docker-ce/ubuntu/
sudo apt-get remove docker docker-engine docker.io containerd runc
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository  "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

#DOCKER-COMPOSE https://docs.docker.com/compose/install/
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

#KOMPOSE http://kompose.io/
curl -L https://github.com/kubernetes/kompose/releases/download/v1.17.0/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv ./kompose /usr/local/bin/kompose

#NODE https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04
sudo apt-get update
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -   
sudo apt-get install nodejs=8
sudo apt-get install npm
# sudo npm install -g n
# sudo n stable
# sudo n latest

#KUBECTL  https://kubernetes.io/docs/tasks/tools/install-kubectl/
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
sudo apt-get update && sudo apt-get install -y apt-transport-https
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee -a /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubectl

#MINIKUBE https://kubernetes.io/docs/tasks/tools/install-minikube/
egrep --color 'vmx|svm' /proc/cpuinfo
rm -rf ~/.minikube
#echo "deb http://download.virtualbox.org/virtualbox/debian xenial contrib" >> /etc/apt/sources.list
sudo apt-get update
sudo apt-get install virtualbox-5.2
sudo apt-get install virtualbox-ext-pack
sudo apt install virtualbox-dkms
sudo apt install libelf-dev
sudo /sbin/vboxconfig
curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64  && chmod +x minikube
sudo cp minikube /usr/local/bin && rm minikube


echo "Starting minikube for first configuration"
minikube start --vm-driver=none
minikube stop

echo "*********************"
echo "COMPONENTS VERSIONS"
echo "********************"
node --version 
docker --version
docker-compose --version
kompose version
nodejs -v
npm -v
kubectl version
minikube version

