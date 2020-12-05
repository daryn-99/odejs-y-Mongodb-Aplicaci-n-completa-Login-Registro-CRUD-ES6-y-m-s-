const express = require('express');
const { route } = require('.');
const router = express.Router();

const Note = require('../models/Note');
const {isAuthenticated} = require("../helpers/auth");

router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/new-note');
});

router.post('/notes/new-note', isAuthenticated, async (req, res) => {
    const { title, description } = req.body;
    const errors = [];
    if(!title){
        errors.push({text: 'Please write a Title'});
    }
    if(!description){
        errors.push({text: 'Please write a Description'});
    }
    if(errors.length>0){
        res.render('notes/new-note', {
           errors,
           title,
           description
        });
    }else {
        const newNote = new Note({title, description});
        newNote.user = req.user.id;
        await newNote.save();
        req.flash('success_msg', 'Note Added Successfully');
        res.redirect('/notes');
    }
});

router.get('/notes', isAuthenticated, async ( req, res) => {
    await Note.find({user: req.user.id}).sort({date: 'desc'})
    .then(documentos => {
        const contexto = {
            notes:documentos.map(documento => {
                return {
                    title:documento.title,
                    description: documento.description
                }
            })
        }
        res.render('notes/all-notes', { notes:contexto.notes })
    })
});

router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {

    const note = await Note.findById(req.params.id);
    res.render('notes/edit-note', {note})
});




/*
router.get('/notes/edit/:id', async (req, res) => {
    await Note.find().sort({date: 'desc'}).lean()
      .then(documentos => {
        const contexto = {
            notes: documentos.map(documento => {
            return {
                title: documento.title,
                description: documento.description,
                _id: documento._id
            }
          })
        }
        res.render('notes/edit-note', {notes: contexto.notes }) 
      })
  });*/



router.put('/notes/edit-note/:id', isAuthenticated, async (req, res) => {
    const {title, description}= req.body;
    await Note.findByIdAndUpdate(req.params.id, {title, description});
    req.flash('success_msg', 'Note Updated Successfully');
    res.redirect('/notes');
});





router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id)
    console.log(req.params.id);
    req.flash('success_msg', 'Note Deleted Successfully');
    res.redirect('/notes');
});

module.exports =router;