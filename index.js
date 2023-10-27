const nti = require("name-to-imdb")
const url = "https://vidsrc.to/embed/"
const fetch = require("node-fetch").default
const express = require("express")
const app = express()

app.use(express.json())

function genURL(name = "", r) {

  name.replace(/^(19|20)\d{2}$/g, "")

  nti(name.replace(/^(19|20)\d{2}$/g, ""), (a, b, c) => {


    r({link: "/play/" + a})

  })
}

function search(name) {

  fetch(`http://www.omdbapi.com/?apikey=2c6e7a77&s=` + name).then(g => g.json()).then(g => {
    return g.Search?.[0] || name
  })

}

const Monitor = require('ping-monitor');

const monitor3 = new Monitor({
  website: 'https://nnfr.jenildobaria.repl.co',
  title: 'NAME',
  interval: 2
});

const monitor = new Monitor({
  website: 'https://watch.jenildobaria.repl.co',
  title: 'NAME',
  interval: 2
});

const monitor2 = new Monitor({
  website: 'https://oldwatch.jenildobaria.repl.co',
  title: 'NAME',
  interval: 2
});

app.get("/api/info", (req, res) => {

  const q = req.query.q

  nti(q, (a, b, c) => {

    if (c?.meta?.type === "TV Series") {

      fetch(url + "tv/" + b).then(r => {
        if (r.status === 404) return res.send({ error: "Sorry We don't have this series available currently" });
        res.send({ message: true })
      })

    } else if (c?.meta?.type === "feature") {

      fetch(url + "movie/" + b).then(r => {
        if (r.status === 404) return res.send({ error: "Sorry We don't have this movie available currently" });

        res.send({ message: true })

      })

    }

  })

})

app.get("/new", function(req, res) {

  fetch("https://vidsrc.to/vapi/movie/new").then(r => r.json()).then(g => {

    let finalArr = []

    g.result.items.forEach(x => {
      genURL(x.title, (r) => {
        console.log(r)
        finalArr.push({ "name": x.title, "url": r.link})
      })
    })
    res.send(finalArr)

  })

})
app.get("/light.png", (req, res) => {
  const fs = require("fs")
  res.setHeader("Content-Type", "image/x-png")
  fs.createReadStream("./light.png").pipe(res)
})
app.get("/dark.png", (req, res) => {
  const fs = require("fs")
  res.setHeader("Content-Type", "image/x-png")
  fs.createReadStream("./dark.png").pipe(res)
})
app.get("/logo.png", (req, res) => {
  const fs = require("fs")
  res.setHeader("Content-Type", "image/x-png")
  fs.createReadStream("./logo.png").pipe(res)
})

app.get("/play/:id", async function(req, res) {

  const fs = require("fs");
  const data = fs.readFileSync("./public/watch.html", "utf-8")
  res.setHeader("Content-Type", "text/html")
  console.log(decodeURI(req.params.id))
  //const name = await search(decodeURIComponent(req.params.id))
  fetch(`http://www.omdbapi.com/?apikey=2c6e7a77&s=` + req.params.id).then(g =>     g.json()).then(g => {
if(g?.Search){
    if(g.Search[0]?.Type === "series"){
      
      res.send(data.replace(/\{link\}/g, `https://vidsrc.to/embed/tv/${g.Search?.[0]?.imdbID}`).replace("{poster}", g?.Search?.[0]?.Poster).replace(/\{title\}/g,g.Search[0]?.Title))
      
    }else if(g.Search[0]?.Type === "movie"){
      
      res.send(data.replace(/\{link\}/g, `https://vidsrc.to/embed/movie/${g?.Search?.[0]?.imdbID}`).replace("{poster}", g.Search[0]?.Poster).replace(/\{title\}/g,g.Search[0]?.Title))
    }    else {
      nti(decodeURI(req.params.id), (a, b, c) => {

    if (c?.meta?.type === "TV series") {


      res.send(data.replace(/\{link\}/g, `https://vidsrc.to/embed/tv/${b}`).replace("{poster}", c?.meta?.image?.src).replace(/\{title\}/g, c?.meta?.name))
      
    } else if (c?.meta?.type === "feature") {

      res.send(data.replace(/\{link\}/g, `https://vidsrc.to/embed/movie/${b}`).replace("{poster}", c?.meta?.image?.src).replace(/\{title\}/g, c?.meta?.name))

    }

  })
    }
    
  }else{
        nti(decodeURI(req.params.id), (a, b, c) => {
    console.log(b)
    if (c?.meta?.type === "TV series") {


      res.send(data.replace(/\{link\}/g, `https://vidsrc.to/embed/tv/${b}`).replace("{poster}", c?.meta?.image?.src).replace(/\{title\}/g, c?.meta?.name))
      
    } else if (c?.meta?.type === "feature") {

      res.send(data.replace(/\{link\}/g, `https://vidsrc.to/embed/movie/${b}`).replace("{poster}", c?.meta?.image?.src).replace(/\{title\}/g, c?.meta?.name))

    }else{
      res.send(data.replace(/\{link\}/g,`https://vidsrc.to/embed/movie/${decodeURI(req.params.id)}`).replace("{poster}", c?.meta?.image?.src).replace(/\{title\}/g, c?.meta?.name))
    }
        })
  }

})
})

app.get("/random", (req,res) =>{
const fs = require('fs');

const data = fs.readFileSync("./movies.txt", "utf8").replace(/[0-9]+,/g, "").replace(/\(+[0-9]+\)/g, "").replace(/\r/g, "").split("\n")

res.redirect("/play/" + data[Math.floor(Math.random() * data.length)])
  
})

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"))

app.listen(8080, () => console.log('listening on port 8080'))
