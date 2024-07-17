# Spécifications fonctionnelles

## Cas d'utilisations

### Contexte global

- N'importe quel utilisateur disposant d'un wallet solana `PEUT` créer une session de dépenses.
  Il devient ainsi `administrateur` de la session.

- Il peut ensuite ajouter des adresses publiques de wallets solana afin d'ajouter des utilisateurs (V1).

### Contexte d'une session de dépenses

- N'importe quel membre de la session (y compris l'administrateur) `PEUT` enregistrer de nouvelles dépenses.

- Seul l'administrateur de la session `PEUT` cloturer la session et déclencher le calcul de répartition.

- Chaque membre de la session `PEUT` consulter la liste des dépenses enregistrées (paginée).

- Chaque membre de la session `PEUT` consulter la liste des membres de la session (paginée).

- Un utilisateur `PEUT` peut déclarer vouloir sortir de la liste des membres (afin de ne plus pouvoir être associé aux futures dépenses).

### Enregistrement d'une dépense

- Un utilisateur qui ajoute une dépense `DOIT` déclarer un titre, une description (optionnelle), un montant, une date et une liste de participants à cette dépense (sélectionnés parmi les membres).

- Seul le créateur d'une dépense `PEUT` modifier ou supprimer celle-ci.

### Evolutions ultérieures

- Il faudrait être en mesure d'envoyer des liens de partage (mail, copie d'url, qrcode...) et réfléchir au moyen controle d'identité des wallets lors de l'ajout de membres dans une session.
- ... ?

## Structures des comptes solana

### Global account

le compte global servira a stocker le compteur de sessions.

```rust
pub struct GlobalAccount {
    pub session_count: u64,
}
```

Il sera identifié par la seed: [`global`]

### Session account

le compte de chaque session servira a stocker les informations primaires de la session ainsi que le compteurs de members.

```rust
pub struct SessionAccount { // 8 discriminator
    pub session_id: u64, // 8
    #[max_len(20)]
    pub name: String, // 4 + 20
    #[max_len(80)]
    pub description: String, // 4 + 80
    pub admin: Pubkey,   // 32
    pub members_count: u8, // 1
    pub expenses_count: u16, // 2
    pub status: SessionStatus, // 1 // opened | closed
}
```

Il sera identifié par la seed: [`session`, session_id]

où lors de la création:

- `session_id` est égal au compteur global lors de la création de la session, cad que l'on devra passer `global_account` dans les `derive(Accounts)`.
- le paramètre `admin` pourra être récupéré à partir du
- les autres paramètres seront passer en paramètres de l'instruction

### Member account

le compte de chaque membre d'une session permettra de stocker son adresse publique ainsi le compteur de dépenses qu'il aura enregistré.

```rust
pub struct MemberAccount { // 8 discriminator
    pub session_id: u64, // 8
    pub member_id: u8, // 1
    pub addr: Pubkey, // 32
    pub owned_expenses_count: u16, // 1 // pas certain que ca serve... ?
}
```

Il sera identifié par la seed: [`member`, session_id, member_id]

où lors de la création:

- `session_id` est égal à `session_id` de la session, cad que l'on devra passer `session_account` dans les `derive(Accounts)`.
- `member_id` est égal au compteur `members_count` de la session, cad que l'on devra passer `session_account` dans les `derive(Accounts)`.
- `addr` est passé en paramètre de l'instruction.
- `owned_expenses_count` est incrémenté

### Expense account

le compte de chaque dépense d'une session permettra de stocker les informations relatives à la dépense.

```rust
pub struct ExpenseAccount { // 8 discriminator
    pub session_id: u64, // 8
    pub exp_id: u16, // 2
    pub owner: Pubkey, // 32 // la publickey du membre ayant fait la dépense
    #[max_len(20)]
    pub title: String, // 4 + 20
    #[max_len(80)]
    pub description: String, // 4 + 80
    pub date: u32, // 4  // si on stocker en u32, il faudra convertir la date en secondes, sinon utiliser u64
    pub amount: u16, // 1 // on limite à 65535sol ? sinon u32
}
```

Il sera identifié par la seed: [`member`, session_id, exp_id]

où lors de la création:

- `session_id` est égal à `session_id` de la session, cad que l'on devra passer `session_account` dans les `derive(Accounts)`.
- `exp_id` est égal au compteur `expenses_count` de la session, cad que l'on devra passer `session_account` dans les `derive(Accounts)`.
- `owner` est défini par le signer de la dépense
- les autres paramètres seront passés en paramètres de l'instruction

## Les instructions

- open_session: Crée une nouvelle session
- add_session_member: Ajoute un nouveau membre dans une session
- add_session_expense: Crée une nouvelle dépense dans une session
- update_session_expense: Modifie une dépense existante
- close_session: Cloture la session en interdisant l'enregistrement de nouveaux membres ou dépenses
-
