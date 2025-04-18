<rosieArtifact title="Add push action keys to InputHandler">
<rosieEdit file="inputHandler.js">
<![CDATA[
<<<<<<< HEAD
        // Prevent default browser behavior for arrow keys and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
            event.preventDefault();
        }
    }
=======
        // Prevent default browser behavior for movement keys and action keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
            event.preventDefault();
        }
    }
>>>>>>> updated
]]>
</rosieEdit>

<rosieEdit file="inputHandler.js">
<![CDATA[
<<<<<<< HEAD
            right: this.isKeyPressed('KeyD'),
            // action: this.isKeyPressed('Space') // Example for later
        };
    }
=======
            right: this.isKeyPressed('KeyD'),
            push: this.isKeyPressed('Space')
        };
    }
>>>>>>> updated
]]>
</rosieEdit>

<rosieEdit file="inputHandler.js">
<![CDATA[
<<<<<<< HEAD
            right: this.isKeyPressed('ArrowRight'),
             // action: this.isKeyPressed('Enter') // Example for later
        };
    }
}
\ No newline at end of file
=======
            right: this.isKeyPressed('ArrowRight'),
            push: this.isKeyPressed('Enter')
        };
    }
}
>>>>>>> updated
]]>
</rosieEdit>
</rosieArtifact>
