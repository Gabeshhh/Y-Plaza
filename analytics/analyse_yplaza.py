"""
Y-Plaza — Analyse et manipulation de données immobilières
Objectifs :
  - Nettoyer et préparer les données pour produire des rapports de ventes
  - Analyses statistiques : biens populaires, prévisions de prix, zones attractives
  - Export de rapports (CSV + graphiques PNG)
"""

import json
import os
import warnings
from datetime import datetime
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore")

OUTPUT_DIR = Path(__file__).parent / "rapports"
OUTPUT_DIR.mkdir(exist_ok=True)

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.prop_cycle": plt.cycler(color=["#C2714A", "#2C2825", "#4A8C5C", "#C24A4A", "#4A6C8C"]),
})

# ──────────────────────────────────────────────────────────────────────────────
# 1. CHARGEMENT ET NETTOYAGE DES DONNÉES
# ──────────────────────────────────────────────────────────────────────────────

def load_and_clean() -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Charge les données depuis les fichiers JSON exportés par l'API Y-Plaza
    (ou génère des données synthétiques si les exports sont absents).
    Retourne (df_properties, df_transactions) nettoyés.
    """
    props_path = Path(__file__).parent / "data" / "properties.json"
    tx_path = Path(__file__).parent / "data" / "transactions.json"

    if props_path.exists() and tx_path.exists():
        with open(props_path) as f:
            raw_props = json.load(f)
        with open(tx_path) as f:
            raw_tx = json.load(f)
        df_props = pd.DataFrame(raw_props)
        df_tx = pd.DataFrame(raw_tx)
    else:
        print("[INFO] Fichiers JSON absents — génération de données synthétiques")
        df_props, df_tx = _generate_synthetic_data()

    # --- Nettoyage biens ---
    df_props["price"] = pd.to_numeric(df_props["price"], errors="coerce")
    df_props["surface"] = pd.to_numeric(df_props["surface"], errors="coerce")
    df_props["views"] = pd.to_numeric(df_props["views"], errors="coerce").fillna(0).astype(int)
    df_props["createdAt"] = pd.to_datetime(df_props["createdAt"], errors="coerce")

    # Suppression des prix aberrants (< 10 000 € ou > 50 M€)
    before = len(df_props)
    df_props = df_props[df_props["price"].between(10_000, 50_000_000)]
    removed = before - len(df_props)
    if removed:
        print(f"[NETTOYAGE] {removed} bien(s) avec prix aberrant supprimé(s)")

    # Prix au m² calculé
    df_props["price_per_m2"] = df_props["price"] / df_props["surface"].replace(0, np.nan)

    # --- Nettoyage transactions ---
    df_tx["agreedPrice"] = pd.to_numeric(df_tx["agreedPrice"], errors="coerce")
    df_tx["createdAt"] = pd.to_datetime(df_tx["createdAt"], errors="coerce")
    df_tx["completedAt"] = pd.to_datetime(df_tx["completedAt"], errors="coerce")

    print(f"[DONNÉES] {len(df_props)} biens | {len(df_tx)} transactions chargés et nettoyés")
    return df_props, df_tx


def _generate_synthetic_data() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Génère des données de démonstration réalistes."""
    rng = np.random.default_rng(42)
    n_props = 120

    cities = ["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse",
              "Nice", "Nantes", "Strasbourg", "Montpellier", "Rennes",
              "Lille", "Grenoble", "Aix-en-Provence"]
    city_base_price = {
        "Paris": 9500, "Nice": 5800, "Lyon": 4200, "Marseille": 3800,
        "Bordeaux": 4500, "Toulouse": 3500, "Nantes": 3800, "Strasbourg": 3200,
        "Montpellier": 3600, "Rennes": 3400, "Lille": 3000, "Grenoble": 3300,
        "Aix-en-Provence": 4800,
    }
    types = ["APPARTEMENT", "MAISON", "VILLA", "BUREAU", "LOCAL_COMMERCIAL", "TERRAIN", "STUDIO"]
    statuses_tx = ["EN_ATTENTE", "COMPROMIS", "ACTE_DEFINITIF", "ANNULEE"]

    cities_arr = rng.choice(cities, n_props)
    types_arr = rng.choice(types, n_props, p=[0.40, 0.25, 0.10, 0.10, 0.08, 0.04, 0.03])
    surfaces = rng.integers(20, 500, n_props).astype(float)
    base_prices = np.array([city_base_price[c] for c in cities_arr])
    prices = (base_prices * surfaces * rng.uniform(0.8, 1.3, n_props)).round(-3)
    views = rng.integers(0, 800, n_props)
    dates = pd.date_range("2023-01-01", periods=n_props, freq="3D")

    df_props = pd.DataFrame({
        "id": range(1, n_props + 1),
        "title": [f"Bien {i}" for i in range(1, n_props + 1)],
        "type": types_arr,
        "price": prices,
        "surface": surfaces,
        "city": cities_arr,
        "views": views,
        "active": True,
        "sold": rng.random(n_props) < 0.3,
        "createdAt": dates,
        "agencyName": rng.choice([f"Y-Plaza {c}" for c in cities], n_props),
    })

    n_tx = 60
    df_tx = pd.DataFrame({
        "id": range(1, n_tx + 1),
        "propertyId": rng.integers(1, n_props + 1, n_tx),
        "agreedPrice": rng.integers(100_000, 2_000_000, n_tx) * 1000 // 1000,
        "status": rng.choice(statuses_tx, n_tx, p=[0.2, 0.2, 0.5, 0.1]),
        "createdAt": pd.date_range("2023-03-01", periods=n_tx, freq="5D"),
        "completedAt": pd.date_range("2023-06-01", periods=n_tx, freq="5D"),
        "agencyName": rng.choice([f"Y-Plaza {c}" for c in cities], n_tx),
    })
    return df_props, df_tx


# ──────────────────────────────────────────────────────────────────────────────
# 2. RAPPORT DE VENTES
# ──────────────────────────────────────────────────────────────────────────────

def rapport_ventes(df_props: pd.DataFrame, df_tx: pd.DataFrame):
    """Génère le rapport de ventes (CSV + graphique CA par agence)."""
    ventes = df_tx[df_tx["status"] == "ACTE_DEFINITIF"].copy()

    if ventes.empty:
        print("[RAPPORT] Aucune vente finalisée trouvée.")
        return

    # Statistiques globales
    stats = {
        "total_transactions": len(ventes),
        "chiffre_affaires_total": ventes["agreedPrice"].sum(),
        "prix_moyen_vente": ventes["agreedPrice"].mean().round(2),
        "prix_median_vente": ventes["agreedPrice"].median(),
        "date_rapport": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }

    # CA par agence
    if "agencyName" in ventes.columns:
        ca_agence = (
            ventes.groupby("agencyName")["agreedPrice"]
            .agg(["sum", "count", "mean"])
            .rename(columns={"sum": "CA_total", "count": "nb_ventes", "mean": "prix_moyen"})
            .sort_values("CA_total", ascending=False)
        )
        ca_agence.to_csv(OUTPUT_DIR / "ca_par_agence.csv")

        fig, ax = plt.subplots(figsize=(12, 6))
        bars = ax.barh(ca_agence.index, ca_agence["CA_total"] / 1_000_000)
        ax.set_xlabel("Chiffre d'affaires (M€)")
        ax.set_title("Chiffre d'affaires par agence — Ventes finalisées", fontsize=14, fontweight="bold")
        ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{x:.1f} M€"))
        for bar in bars:
            ax.text(bar.get_width() + 0.05, bar.get_y() + bar.get_height() / 2,
                    f"{bar.get_width():.1f} M€", va="center", fontsize=9)
        plt.tight_layout()
        plt.savefig(OUTPUT_DIR / "ca_par_agence.png", dpi=150)
        plt.close()
        print("[RAPPORT] ca_par_agence.csv + ca_par_agence.png générés")

    # Export stats globales
    pd.DataFrame([stats]).to_csv(OUTPUT_DIR / "rapport_ventes_global.csv", index=False)
    print(f"[RAPPORT] CA total : {stats['chiffre_affaires_total']:,.0f} € | {stats['total_transactions']} ventes")


# ──────────────────────────────────────────────────────────────────────────────
# 3. BIENS POPULAIRES
# ──────────────────────────────────────────────────────────────────────────────

def analyse_popularite(df_props: pd.DataFrame):
    """Identifie les biens les plus consultés et les facteurs de popularité."""
    top10 = df_props.nlargest(10, "views")[["title", "city", "type", "price", "surface", "views"]]
    top10.to_csv(OUTPUT_DIR / "top10_biens_populaires.csv", index=False)

    # Vues moyennes par type
    vues_par_type = df_props.groupby("type")["views"].mean().sort_values(ascending=False)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Top 10 biens
    ax1 = axes[0]
    ax1.barh(top10["title"].str[:30], top10["views"])
    ax1.set_title("Top 10 biens les plus consultés", fontweight="bold")
    ax1.set_xlabel("Vues")

    # Vues par type
    ax2 = axes[1]
    ax2.bar(vues_par_type.index, vues_par_type.values)
    ax2.set_title("Vues moyennes par type de bien", fontweight="bold")
    ax2.set_ylabel("Vues moyennes")
    ax2.tick_params(axis="x", rotation=30)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "popularite_biens.png", dpi=150)
    plt.close()
    print("[ANALYSE] top10_biens_populaires.csv + popularite_biens.png générés")


# ──────────────────────────────────────────────────────────────────────────────
# 4. PRÉVISIONS DE PRIX PAR VILLE
# ──────────────────────────────────────────────────────────────────────────────

def previsions_prix(df_props: pd.DataFrame):
    """
    Régression linéaire : prédit le prix d'un bien selon surface + ville.
    Affiche les zones les plus attractives (prix/m² et potentiel investissement).
    """
    df = df_props.dropna(subset=["price", "surface", "city"]).copy()

    le = LabelEncoder()
    df["city_enc"] = le.fit_transform(df["city"])

    X = df[["surface", "city_enc"]].values
    y = df["price"].values

    model = LinearRegression()
    model.fit(X, y)
    df["prix_predit"] = model.predict(X)
    df["ecart_pct"] = ((df["price"] - df["prix_predit"]) / df["prix_predit"] * 100).round(1)

    # Zones intéressantes : prix réel < prix prédit → sous-évalué → opportunité d'achat
    opportunites = (
        df[df["ecart_pct"] < -10]
        .nsmallest(10, "ecart_pct")[["title", "city", "type", "price", "surface", "prix_predit", "ecart_pct"]]
    )
    opportunites.to_csv(OUTPUT_DIR / "opportunites_achat.csv", index=False)

    # Prix moyen par ville
    prix_ville = df.groupby("city").agg(
        prix_moyen=("price", "mean"),
        prix_m2_moyen=("price_per_m2", "mean"),
        nb_biens=("id", "count"),
    ).sort_values("prix_m2_moyen", ascending=False).round(0)
    prix_ville.to_csv(OUTPUT_DIR / "prix_par_ville.csv")

    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # Prix m² par ville
    ax1 = axes[0]
    ax1.barh(prix_ville.index, prix_ville["prix_m2_moyen"])
    ax1.set_title("Prix moyen au m² par ville", fontweight="bold")
    ax1.set_xlabel("Prix/m²  (€)")
    ax1.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{x:,.0f} €"))

    # Scatter prix réel vs prédit
    ax2 = axes[1]
    ax2.scatter(df["prix_predit"] / 1000, df["price"] / 1000, alpha=0.5, s=20)
    lims = [0, max(df["prix_predit"].max(), df["price"].max()) / 1000]
    ax2.plot(lims, lims, "r--", linewidth=1, label="Prix = Prédit")
    ax2.set_xlabel("Prix prédit (k€)")
    ax2.set_ylabel("Prix réel (k€)")
    ax2.set_title("Prix réel vs prédit (régression linéaire)", fontweight="bold")
    ax2.legend()

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "previsions_prix.png", dpi=150)
    plt.close()

    score = model.score(X, y)
    print(f"[PREVISIONS] Modèle R²={score:.3f} | opportunites_achat.csv + previsions_prix.png générés")


# ──────────────────────────────────────────────────────────────────────────────
# 5. ZONES GÉOGRAPHIQUES ATTRACTIVES
# ──────────────────────────────────────────────────────────────────────────────

def zones_attractives(df_props: pd.DataFrame, df_tx: pd.DataFrame):
    """
    Croise vues, ventes finalisées et prix pour scorer chaque ville.
    Score = (nb_ventes_norm + vues_norm - prix_m2_norm) → zones accessibles et demandées.
    """
    ventes_ville = (
        df_tx[df_tx["status"] == "ACTE_DEFINITIF"]
        .merge(df_props[["id", "city"]], left_on="propertyId", right_on="id", how="left")
        .groupby("city")["agreedPrice"]
        .count()
        .rename("nb_ventes")
    ) if "propertyId" in df_tx.columns else pd.Series(dtype=int, name="nb_ventes")

    stats_ville = df_props.groupby("city").agg(
        vues_total=("views", "sum"),
        nb_biens=("id", "count"),
        prix_m2_moyen=("price_per_m2", "mean"),
    ).join(ventes_ville, how="left").fillna(0)

    # Normalisation min-max
    def norm(s):
        rng = s.max() - s.min()
        return (s - s.min()) / rng if rng > 0 else s * 0

    stats_ville["score_attractivite"] = (
        norm(stats_ville["nb_ventes"]) * 0.40
        + norm(stats_ville["vues_total"]) * 0.35
        - norm(stats_ville["prix_m2_moyen"]) * 0.25
    ).round(3)

    stats_ville = stats_ville.sort_values("score_attractivite", ascending=False)
    stats_ville.to_csv(OUTPUT_DIR / "zones_attractives.csv")

    fig, ax = plt.subplots(figsize=(12, 6))
    colors = ["#C2714A" if i < 3 else "#2C2825" for i in range(len(stats_ville))]
    bars = ax.bar(stats_ville.index, stats_ville["score_attractivite"], color=colors)
    ax.set_title("Score d'attractivité par ville\n(ventes + vues − prix)", fontweight="bold")
    ax.set_ylabel("Score (0 = peu attractif, 1 = très attractif)")
    ax.tick_params(axis="x", rotation=35)
    for bar in bars[:3]:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.01,
                "TOP", ha="center", fontsize=8, color="#C2714A", fontweight="bold")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "zones_attractives.png", dpi=150)
    plt.close()
    print("[ZONES] zones_attractives.csv + zones_attractives.png générés")
    print(f"[ZONES] Top 3 villes : {', '.join(stats_ville.index[:3].tolist())}")


# ──────────────────────────────────────────────────────────────────────────────
# 6. POINT D'ENTRÉE
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  Y-Plaza — Analyse de données immobilières")
    print(f"  {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print("=" * 60)

    df_properties, df_transactions = load_and_clean()

    rapport_ventes(df_properties, df_transactions)
    analyse_popularite(df_properties)
    previsions_prix(df_properties)
    zones_attractives(df_properties, df_transactions)

    print("\n[DONE] Tous les rapports sont dans le dossier analytics/rapports/")
