
class AbrigoAnimais {
  encontraPessoas(brinquedosPessoa1, brinquedosPessoa2, ordemAnimais) {
    //preparar os dados
    const { animais, nomesValidos } = this.prepararDados();//objeto com dados dos animais e array com nomes válidos
    
    //validar entradas
    const erroValidacao = this.validarEntradas(brinquedosPessoa1, brinquedosPessoa2, ordemAnimais, animais, nomesValidos);
    if (erroValidacao) return erroValidacao;//se retornar algo, é um erro
                                            //se retornar null, está tudo ok
    //processar adoções
    const listaAnimais = ordemAnimais.split(",").map(nome => nome.trim());
    const resultados = this.processarAdocoes(listaAnimais, brinquedosPessoa1, brinquedosPessoa2, animais);

    //formatar saída
    return this.formatarSaida(resultados);
  }

  prepararDados() {
    const animais = {
      Rex: { tipo: "cão", favoritos: ["RATO", "BOLA"] },
      Mimi: { tipo: "gato", favoritos: ["BOLA", "LASER"] },
      Fofo: { tipo: "gato", favoritos: ["BOLA", "RATO", "LASER"] },
      Zero: { tipo: "gato", favoritos: ["RATO", "BOLA"] },
      Bola: { tipo: "cão", favoritos: ["CAIXA", "NOVELO"] },
      Bebe: { tipo: "cão", favoritos: ["LASER", "RATO", "BOLA"] },
      Loco: { tipo: "jabuti", favoritos: ["SKATE", "RATO"] },
    };
    
    const nomesValidos = Object.keys(animais);
    return { animais, nomesValidos };
  }

  validarEntradas(brinquedosPessoa1, brinquedosPessoa2, ordemAnimais, animais, nomesValidos) {
    //validar animais
    const erroAnimais = this.validarAnimais(ordemAnimais, nomesValidos);
    if (erroAnimais) return erroAnimais;//se retornar algo, é um erro 
                                        //se retornar null, está tudo ok
    
    //validar brinquedos
    const todosBrinquedos = this.obterTodosBrinquedos(animais);
    const erroBrinquedos = this.validarBrinquedos(brinquedosPessoa1, todosBrinquedos) || this.validarBrinquedos(brinquedosPessoa2, todosBrinquedos);
    return erroBrinquedos;//se retornar algo, é um erro
                          //se retornar null, está tudo ok
  }

  validarAnimais(ordemAnimais, nomesValidos) {
    const animaisVerificados = new Set();
    const listaAnimais = ordemAnimais.split(",").map(nome => nome.trim());
    
    for (const animal of listaAnimais) {
      if (!nomesValidos.includes(animal)) {
        return { erro: "Animal inválido" };
      }
      if (animaisVerificados.has(animal)) {
        return { erro: "Animal inválido" };
      }
      animaisVerificados.add(animal);
    }
    return null;
  }

    validarBrinquedos(lista, todosBrinquedos) {
    const verificados = new Set();
    const brinquedos = lista.split(",").map(b => b.trim());
    
    for (const brinquedo of brinquedos) {
      if (!todosBrinquedos.has(brinquedo)) {
        return { erro: "Brinquedo inválido" };
      }
      if (verificados.has(brinquedo)) {
        return { erro: "Brinquedo inválido" };
      }
      verificados.add(brinquedo);
    }
    return null;
  }

  obterTodosBrinquedos(animais) {
    const todosBrinquedos = new Set();
    Object.values(animais).forEach(animal => {
      animal.favoritos.forEach(brinquedo => todosBrinquedos.add(brinquedo));
    });
    return todosBrinquedos;
  }

  processarAdocoes(listaAnimais, brinquedosPessoa1, brinquedosPessoa2, animais) {
    const adotadosP1 = [];
    const adotadosP2 = [];
    const resultados = [];

    for (const nomeAnimal of listaAnimais) {
      const destino = this.determinarDestino(nomeAnimal, brinquedosPessoa1, brinquedosPessoa2, animais, adotadosP1, adotadosP2);
      
      if (destino === "pessoa 1") adotadosP1.push(nomeAnimal);
      if (destino === "pessoa 2") adotadosP2.push(nomeAnimal);
      
      resultados.push({ animal: nomeAnimal, destino });
    }
    
    return resultados;
  }

  determinarDestino(nomeAnimal, brinquedosPessoa1, brinquedosPessoa2, animais, adotadosP1, adotadosP2) {
    const p1Pode = this.pessoaPodeAdotar(brinquedosPessoa1, nomeAnimal, adotadosP1, animais);
    const p2Pode = this.pessoaPodeAdotar(brinquedosPessoa2, nomeAnimal, adotadosP2, animais);

    //se ambos podem adotar, fica no abrigo
    return this.aplicarRegraExclusividade(p1Pode, p2Pode);
  }

  pessoaPodeAdotar(brinquedos, nomeAnimal, adotados, animais) {
    const temLimite = adotados.length < 3;
    const temCompatibilidade = this.verificarCompatibilidade(brinquedos, nomeAnimal, adotados, animais);
    return temLimite && temCompatibilidade;
  }

  verificarCompatibilidade(brinquedos, nomeAnimal, adotados, animais) {
    const animal = animais[nomeAnimal];
    const listaBrinquedos = brinquedos.split(",").map(b => b.trim());

    if (nomeAnimal === "Loco") {
      return this.verificarRegraLoco(listaBrinquedos, animal, adotados);
    }
    
    //verifica regra dos gatos - sempre verifica se tem conflito com gatos já adotados
    const podeAdotarComGatos = this.verificarRegraGatos(animal, adotados, animais);
    if (!podeAdotarComGatos) return false;
    
    return this.verificarOrdemBrinquedos(listaBrinquedos, animal);
  }

  verificarRegraLoco(listaBrinquedos, animal, adotados) {
    const temCompanhia = adotados.length > 0;
    
    if (temCompanhia) {
      //se tem companhia, não liga para ordem (apenas precisa ter todos os brinquedos)
      return animal.favoritos.every(fav => listaBrinquedos.includes(fav));
    } else {
      //se não tem companhia, liga para ordem (segue regra normal)
      return this.verificarOrdemBrinquedos(listaBrinquedos, animal);
    }
  }

  verificarOrdemBrinquedos(listaBrinquedos, animal) {
    let posicao = 0;
    for (const brinquedo of listaBrinquedos) {
      if (brinquedo === animal.favoritos[posicao]) {
        posicao++;
        if (posicao === animal.favoritos.length) {
          return true;
        }
      }
    }
    return false;
  }

  verificarRegraGatos(animalAtual, adotados, animais) {
    for (const nomeAnimalAdotado of adotados) {
      const animalAdotado = animais[nomeAnimalAdotado];
      
      //verifica conflito se um dos dois for gato
      const animalAtualEhGato = animalAtual.tipo === "gato";
      const animalAdotadoEhGato = animalAdotado.tipo === "gato";
      
      if (animalAtualEhGato || animalAdotadoEhGato) {
        //gato não pode ser adotado se tiver conflito de brinquedos
        const brinquedosComuns = animalAtual.favoritos.filter(brinquedo => 
          animalAdotado.favoritos.includes(brinquedo)
        );
        
        if (brinquedosComuns.length > 0) {
          return false; //não pode adotar pois tem brinquedos em comum
        }
      }
    }
    return true;
  }

  aplicarRegraExclusividade(p1Pode, p2Pode) {
    if (p1Pode && p2Pode) return "abrigo";
    if (p1Pode) return "pessoa 1";
    if (p2Pode) return "pessoa 2";
    return "abrigo";
  }

  formatarSaida(resultados) {
    resultados.sort((a, b) => a.animal.localeCompare(b.animal));
    const lista = resultados.map(r => `${r.animal} - ${r.destino}`);
    return { lista };
  }
}

export { AbrigoAnimais };