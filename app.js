var express = require('express'),
    bodyParser = require("body-parser"),    
    mongoose = require('mongoose'),
    methodOveride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    app = express()

mongoose.connect("mongodb://localhost/restful_blog",{ useNewUrlParser: true, useUnifiedTopology: true  })
app.set('view engine','ejs');

app.use(express.static(__dirname +'/public'));
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressSanitizer())
app.use(methodOveride("_method"))

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now }
})

var Blog = mongoose.model('Blog', blogSchema)

app.get("/",function(req,res){
    res.redirect('/blogs')
})

app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log("error")
        }else{
            res.render('index',{blogs: blogs})
        }
    })
    
})

app.get('/blogs/new',function(req,res){
    res.render('new')
})

app.post('/blogs',function(req,res){
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body)
    console.log("+++++++++++");
    console.log(req.body);
    Blog.create(req.body.blog,function(err,newBlog){
        if(err){
            res.render('new');
        }else{
            res.redirect('/blogs')
        }
    })
})

app.get("/blogs/:id",function(req,res){
    Blog.findById( req.params.id, function(err,oneBlog){
        if(err){
            res.redirect('/blogs')
        }else{
            res.render('show',{ oneBlog: oneBlog })
        }
    })
})


app.get("/blogs/:id/edit",function(req,res){
    Blog.findById( req.params.id, function(err, editBlog){
        if(err){
            res.redirect('/blogs')
        }else{
            res.render('edit', { editBlog: editBlog })
        }
    })
})


app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id,req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect('/blogs/' + req.params.id);
        }
    })
})

app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/blogs')
        }else{
            res.redirect("/blogs")
        }
    })
})


app.listen(3000,function(){
    console.log('Server is running at port 3000')
})