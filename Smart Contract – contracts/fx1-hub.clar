(define-map hubs
  ((id uint))
  ((name (string-ascii 50))
   (owner principal)
   (members (list 10 principal))))

(define-public (create-hub (hub-id uint) (hub-name (string-ascii 50)))
  (begin
    (map-insert hubs ((id hub-id)) ((name hub-name) (owner tx-sender) (members (list tx-sender))))
    (ok hub-id)
  )
)

(define-public (add-member (hub-id uint) (member principal))
  (let ((hub (map-get hubs ((id hub-id)))))
    (if hub
      (map-set hubs ((id hub-id))
        ((name (get name hub)) (owner (get owner hub)) (members (append (get members hub) (list member)))))
      (err "Hub not found"))))
