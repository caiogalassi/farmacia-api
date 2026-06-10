package com.farmacia.repository;

import com.farmacia.model.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {

    List<Medicamento> findByNomeContainingIgnoreCase(String nome);

    Optional<Medicamento> findByCodigoBarras(String codigoBarras);

    List<Medicamento> findByCategoria(String categoria);

    @Query("SELECT m FROM Medicamento m WHERE m.quantidade <= m.quantidadeMinima")
    List<Medicamento> findEstoqueBaixo();

    @Query("SELECT m FROM Medicamento m WHERE m.dataValidade <= :dataLimite AND m.dataValidade >= CURRENT_DATE")
    List<Medicamento> findVencendoEm(LocalDate dataLimite);

    @Query("SELECT m FROM Medicamento m WHERE m.dataValidade < CURRENT_DATE")
    List<Medicamento> findVencidos();

    @Query("SELECT DISTINCT m.categoria FROM Medicamento m ORDER BY m.categoria")
    List<String> findAllCategorias();
}
