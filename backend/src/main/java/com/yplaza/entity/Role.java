package main.java.com.yplaza.entity;

/**
 * Rôles disponibles dans Y-Plaza.
 * Correspond à la matrice des droits définie dans le cahier des charges.
 */
public enum Role {
    /** Direction : accès lecture/écriture sur tous les dossiers */
    DIRECTION,

    /** Commercial (agence) : accès dossiers commerciaux */
    COMMERCIAL,

    /** Communication & Marketing */
    COMMUNICATION_MARKETING,

    /** Administratif - RH - Juridique */
    ADMINISTRATIF_RH_JURIDIQUE,

    /** IT et Support : accès technique */
    IT_SUPPORT,

    /** Client final : peut consulter et soumettre des demandes */
    CLIENT
}
