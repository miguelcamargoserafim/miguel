/* Edite aqui apenas informações documentadas. Imagens ficam em images.js. */
(function(lab){
  lab.mountProjects=function(parent){
    const {element:el}=lab;
    const projects=[
      {name:'Daí Lanches',status:'Em desenvolvimento',description:'Projeto de website para Daí Lanches. A versão pública está disponível para acompanhar o desenvolvimento.',url:'https://dai-lanches.vercel.app/',image:'dai'},
      {name:'Signal Solution',status:'Em desenvolvimento',description:'Website da Signal Solution, separado do aplicativo interno de leads.',url:'https://signalsolutionsbr.vercel.app/',image:'signal'},
      {name:'Leads Signal Solution',status:'Em desenvolvimento · aplicativo interno',description:'Aplicativo interno de leads. Não há link público documentado.',image:'leads'},
      {name:'DreamStation',status:'Documentação pendente',description:'Projeto citado por Miguel. Estado, tecnologias, funcionalidades, captura e link ainda não foram informados.'}
    ];
    const grid=el('div',undefined,'lab-project-grid');
    projects.forEach(project=>{
      const article=el(project.url?'a':'article',undefined,'lab-project');
      if(project.url){article.href=project.url;article.target='_blank';article.rel='noopener noreferrer';article.setAttribute('aria-label','Visitar '+project.name+' (abre em nova aba)');}
      const source=project.image&&window.portfolioImages?.[project.image];
      if(source){const image=el('img');image.src=source;image.alt='Prévia de '+project.name;image.loading='lazy';image.addEventListener('error',()=>image.replaceWith(el('p','Captura indisponível.')),{once:true});article.append(image);}
      article.append(el('p',project.status,'lab-kicker'),el('h4',project.name),el('p',project.description));
      if(project.url){const link=el('span','Visitar versão disponível ↗','lab-link');article.append(link);}
      grid.append(article);
    });parent.append(grid);
  };
})(window.StackLab);
